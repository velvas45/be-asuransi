const mongoose = require("mongoose");

const noPolisSchema = mongoose.Schema(
  {
    dataPengajuan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pengajuan",
      required: true,
    },
    dataInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    jenisPenanggungan: {
      type: String,
      // required: true,
      default: "Asuransi Kebakaran",
      Enum: ["Asuransi Kebakaran"],
    },
    noPolis: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Data_polis", noPolisSchema);
