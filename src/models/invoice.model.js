const mongoose = require("mongoose");

function getCosts(value) {
  if (typeof value !== "undefined") {
    return parseFloat(value.toString());
  }
  return value;
}

const invoiceSchema = mongoose.Schema(
  {
    pengajuanAsuransi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pengajuan",
      required: true,
    },
    nomorInvoice: {
      type: String,
      required: true,
      unique: true,
    },
    biayaAdministrasi: {
      type: mongoose.Schema.Types.Decimal128,
      default: 10000,
      required: true,
      get: getCosts,
    },
    biayaPremiDasar: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: getCosts,
    },
    totalInvoice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: getCosts,
    },
    keterangan: {
      type: String,
      default: "Belum Bayar",
      enum: ["Sudah Dibayar", "Belum Bayar"],
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
