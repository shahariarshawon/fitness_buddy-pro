const foodItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      // g, cup, piece, roti, bowl, tbsp, tsp, scoop
    },

    gramAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    calories: {
      type: Number,
      default: 0,
    },

    protein: {
      type: Number,
      default: 0,
    },

    carbs: {
      type: Number,
      default: 0,
    },

    fats: {
      type: Number,
      default: 0,
    },

    fiber: {
      type: Number,
      default: 0,
    },

    sugar: {
      type: Number,
      default: 0,
    },

    sodium: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);