const mongoose = require("mongoose");

const okupasiSchema = mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
    },
    nilaiPremi: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Okupasi", okupasiSchema);
