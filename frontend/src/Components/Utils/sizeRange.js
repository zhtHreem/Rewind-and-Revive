// sizeRanges.js

const sizeRanges = {
  women: {
    small: {
      top: {
        bustChest: { min: 32, max: 34 },
        waist: { min: 24, max: 27 },
        hips: { min: 34, max: 37 },
        shoulderWidth: { min: 14, max: 15 },
        armLength: { min: 30, max: 31 },
        neckCircumference: { min: 13, max: 14 }
      },
      bottom: {
        waist: { min: 24, max: 27 },
        hips: { min: 34, max: 37 },
        inseam: { min: 29, max: 30 },
        thighLegOpening: { min: 19, max: 21 },
        rise: { min: 9, max: 10 }
      }
    },
    medium: {
      top: {
        bustChest: { min: 35, max: 38 },
        waist: { min: 28, max: 31 },
        hips: { min: 38, max: 41 },
        shoulderWidth: { min: 15, max: 16 },
        armLength: { min: 31, max: 32 },
        neckCircumference: { min: 14, max: 15 }
      },
      bottom: {
        waist: { min: 28, max: 31 },
        hips: { min: 38, max: 41 },
        inseam: { min: 30, max: 31 },
        thighLegOpening: { min: 21, max: 23 },
        rise: { min: 10, max: 11 }
      }
    },
    large: {
      top: {
        bustChest: { min: 39, max: 42 },
        waist: { min: 32, max: 35 },
        hips: { min: 42, max: 45 },
        shoulderWidth: { min: 16, max: 17 },
        armLength: { min: 32, max: 33 },
        neckCircumference: { min: 15, max: 16 }
      },
      bottom: {
        waist: { min: 32, max: 35 },
        hips: { min: 42, max: 45 },
        inseam: { min: 31, max: 32 },
        thighLegOpening: { min: 23, max: 25 },
        rise: { min: 11, max: 12 }
      }
    }
  },
    men: {
    small: {
      top: {
        bustChest: { min: 34, max: 36 },
        waist: { min: 28, max: 30 },
        shoulderWidth: { min: 16, max: 17 },
        armLength: { min: 32, max: 33 },
        neckCircumference: { min: 14, max: 15 }
      },
      bottom: {
        waist: { min: 28, max: 30 },
        hips: { min: 35, max: 37 },
        inseam: { min: 30, max: 31 },
        thighLegOpening: { min: 21, max: 22 },
        rise: { min: 10, max: 11 }
      }
    },
    medium: {
      top: {
        bustChest: { min: 37, max: 40 },
        waist: { min: 31, max: 34 },
        shoulderWidth: { min: 17, max: 18 },
        armLength: { min: 33, max: 34 },
        neckCircumference: { min: 15, max: 16 }
      },
      bottom: {
        waist: { min: 31, max: 34 },
        hips: { min: 38, max: 41 },
        inseam: { min: 31, max: 32 },
        thighLegOpening: { min: 22, max: 24 },
        rise: { min: 11, max: 12 }
      }
    },
    large: {
      top: {
        bustChest: { min: 41, max: 44 },
        waist: { min: 35, max: 38 },
        shoulderWidth: { min: 18, max: 19 },
        armLength: { min: 34, max: 35 },
        neckCircumference: { min: 16, max: 17 }
      },
      bottom: {
        waist: { min: 35, max: 38 },
        hips: { min: 42, max: 45 },
        inseam: { min: 32, max: 33 },
        thighLegOpening: { min: 24, max: 26 },
        rise: { min: 12, max: 13 }
      }
    }
  },
  kids: {
    small: {
      top: {
        bustChest: { min: 24, max: 26 },
        waist: { min: 22, max: 23 },
        shoulderWidth: { min: 12, max: 13 },
        armLength: { min: 20, max: 22 },
        neckCircumference: { min: 11, max: 12 }
      },
      bottom: {
        waist: { min: 22, max: 23 },
        hips: { min: 26, max: 28 },
        inseam: { min: 20, max: 22 },
        thighLegOpening: { min: 14, max: 15 },
        rise: { min: 7, max: 8 }
      }
    },
    medium: {
      top: {
        bustChest: { min: 27, max: 29 },
        waist: { min: 24, max: 25 },
        shoulderWidth: { min: 13, max: 14 },
        armLength: { min: 22, max: 24 },
        neckCircumference: { min: 12, max: 13 }
      },
      bottom: {
        waist: { min: 24, max: 25 },
        hips: { min: 29, max: 31 },
        inseam: { min: 22, max: 24 },
        thighLegOpening: { min: 15, max: 16 },
        rise: { min: 8, max: 9 }
      }
    },
    large: {
      top: {
        bustChest: { min: 30, max: 32 },
        waist: { min: 26, max: 27 },
        shoulderWidth: { min: 14, max: 15 },
        armLength: { min: 24, max: 26 },
        neckCircumference: { min: 13, max: 14 }
      },
      bottom: {
        waist: { min: 26, max: 27 },
        hips: { min: 32, max: 34 },
        inseam: { min: 24, max: 26 },
        thighLegOpening: { min: 16, max: 17 },
        rise: { min: 9, max: 10 }
      }
    }
  }
};


export default sizeRanges;