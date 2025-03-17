import * as tf from '@tensorflow/tfjs';
import sharp from 'sharp';
import Product from '../models/product.js';
import https from 'https';
import http from 'http';

class ProductMatcher {
    constructor() {
        this.compatibilityRules = {
            top: ['bottom', 'accessories'],
            bottom: ['top', 'accessories'],
            'top/bottom': ['top', 'bottom', 'accessories'],
            accessories: ['top', 'bottom', 'top/bottom']
        };
        this.modelLoaded = false;
    }

    async downloadImage(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            
            protocol.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download image: ${response.statusCode}`));
                    return;
                }

                const chunks = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', reject);
            }).on('error', reject);
        });
    }

    async loadFeatureExtractor() {
        if (!this.modelLoaded) {
            try {
                const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
                this.featureExtractor = tf.model({
                    inputs: model.inputs,
                    outputs: model.layers[model.layers.length - 2].output
                });
                this.modelLoaded = true;
            } catch (error) {
               // console.error('Error loading model:', error);
                throw new Error('Failed to load feature extractor model');
            }
        }
    }
    

    async processImage(imageSource) {
        try {
            let imageBuffer;
            
            if (typeof imageSource === 'string' && (imageSource.startsWith('http://') || imageSource.startsWith('https://'))) {
                // Download remote image
                imageBuffer = await this.downloadImage(imageSource);
            } else {
                // Local file or buffer
                imageBuffer = imageSource;
            }

            // Process with Sharp
            const processedBuffer = await sharp(imageBuffer)
                .resize(224, 224)
                .removeAlpha()
                .raw()
                .toBuffer();

            const pixels = new Float32Array(processedBuffer.length);
            for (let i = 0; i < processedBuffer.length; i++) {
                pixels[i] = processedBuffer[i] / 255.0;
            }

            return pixels;
        } catch (error) {
            throw new Error(`Image processing failed: ${error.message}`);
        }
    }

    
    async extractFeatures(imageSource) {
        try {
            const pixels = await this.processImage(imageSource);

            return tf.tidy(() => {
                const tensor = tf.tensor4d(pixels, [1, 224, 224, 3]);
                const features = this.featureExtractor.predict(tensor);
                return features.dataSync();
            });
        } catch (error) {
            throw new Error(`Feature extraction failed: ${error.message}`);
        }
    }

    cosineSimilarity(vec1, vec2) {
        return tf.tidy(() => {
            const t1 = tf.tensor1d(vec1);
            const t2 = tf.tensor1d(vec2);
            const dotProduct = t1.dot(t2);
            const norm1 = t1.norm();
            const norm2 = t2.norm();
            return dotProduct.div(norm1.mul(norm2)).dataSync()[0];
        });
    }

    async recommendProducts(productId, options = {}) {
        const {
            topK = 6,
            matchType = true,
            matchMaterials = true,
            matchCategories = true,
            category = ''
        } = options;

        try {
            await this.loadFeatureExtractor();

            const baseProduct = await Product.findById(productId);
            if (!baseProduct || !baseProduct.images || !baseProduct.images.length) {
                throw new Error('Product not found or has no images');
            }

            // console.log('Processing base product image:', baseProduct.images[0]);
            // const baseFeatures = await this.extractFeatures(baseProduct.images[0]);

            //  console.log('Processing base product image:', baseProduct.featureVector)
            // Check if feature vector exists
        if (!baseProduct.featureVector || baseProduct.featureVector.length === 0) {
            // If no feature vector, extract it now and save it
            await this.loadFeatureExtractor();
            const features = await this.extractFeatures(baseProduct.images[0]);
            console.log('features:');
            // Update the product with the feature vector
            await Product.findByIdAndUpdate(productId, {
                featureVector: Array.from(features)
            });
            
            // Refresh the product data
            baseProduct.featureVector = Array.from(features);
        }

            const query = {
                _id: { $ne: productId },
                featureVector: { $exists: true, $ne: [] }, // Only get products with feature vectors
                'images.0': { $exists: true }
            };

            // Add category filtering
        if (category && category !== '') {
            query.category = category;
        }

            if (matchType) {
                query.type = baseProduct.type;
            } else if (this.compatibilityRules[baseProduct.type]) {
                query.type = { $in: this.compatibilityRules[baseProduct.type] };
            }

            if (matchMaterials && baseProduct.materials?.length) {
                query.materials = { $in: baseProduct.materials };
            }
            if (matchCategories && baseProduct.categories?.length) {
                query.categories = { $in: baseProduct.categories };
            }

            const compatibleProducts = await Product.find(query);
                    console.log(`Found ${compatibleProducts.length} compatible products`);

            const similarities = [];

            // Process in smaller batches
            // const batchSize = 5;
            // for (let i = 0; i < compatibleProducts.length; i += batchSize) {
            //     const batch = compatibleProducts.slice(i, i + batchSize);
            //     const batchPromises = batch.map(async (product) => {
            //         try {
            //            // console.log('Processing comparison product image:', product.images[0]);
            //             const productFeatures = await this.extractFeatures(product.images[0]);
            //             const similarity = this.cosineSimilarity(baseFeatures, productFeatures);
            //             return {
            //                 product,
            //                 similarity,
            //                 matchScore: this.calculateMatchScore(baseProduct, product)
            //             };
            //         } catch (error) {
            //             console.warn(`Skipping product ${product._id} due to error:`, error.message);
            //             return null;
            //         }
            //     });

            //     const batchResults = await Promise.all(batchPromises);
            //     similarities.push(...batchResults.filter(result => result !== null));
            // }
              

            for (const product of compatibleProducts) {
                
                if (!product.featureVector || !Array.isArray(product.featureVector) || product.featureVector.length === 0) {
                console.warn(`Product ${product._id} has invalid feature vector, skipping`);
                continue;
            }
            const similarity = this.cosineSimilarity(baseProduct.featureVector, product.featureVector);
            similarities.push({
                product,
                similarity,
                matchScore: this.calculateMatchScore(baseProduct, product)
            });
        }

            return similarities
                .sort((a, b) => b.similarity + b.matchScore - (a.similarity + a.matchScore))
                .slice(0, topK);

        } catch (error) {
            console.error('Error in recommendProducts:', error);
            throw error;
        }
    }

    calculateMatchScore(baseProduct, matchProduct) {
        let score = 0;

        if (baseProduct.materials?.some(m => matchProduct.materials?.includes(m))) {
            score += 0.2;
        }
        if (baseProduct.categories?.some(c => matchProduct.categories?.includes(c))) {
            score += 0.2;
        }
        if (baseProduct.color === matchProduct.color) {
            score += 0.1;
        }

        return score;
    }
}

export default ProductMatcher;