const mongoose = require("mongoose");

const pengajuanSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    okupasiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Okupasi",
      required: true,
    },
    tipeAsuransi: {
      type: String,
      default: "Kebakaran",
    },
    jangkaWaktu: {
      type: Number,
      required: true,
    },
    harga: {
      type: Number,
      required: true,
    },
    kontruksi: {
      type: String,
      required: true,
      enum: ["kelas 1", "kelas 2", "kelas 3"],
    },
    alamat: {
      alamat: {
        type: String,
        required: true,
      },
      provinsi: {
        type: String,
        required: true,
      },
      kota: {
        type: String,
        required: true,
      },
      kabupaten: {
        type: String,
        required: true,
      },
      daerah: {
        type: String,
        required: true,
      },
    },
    gempa: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["belum konfirmasi", "pending", "disetujui", "ditolak"],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Pengajuan", pengajuanSchema);
