const PengajuanAsuransi = require("../models/pengajuanAsuransi.model");
const Invoice = require("../models/invoice.model");
const { getRandomNumbers } = require("../utils/generateInvoiceNumber");
const Okupasi = require("../models/okupasi.model");
const Polis = require("../models/dataPolis.model");

// USER FLOW

exports.create = async (req, res) => {
  try {
    if (
      !req.body.okupasi_id ||
      !req.body.jangka_waktu ||
      !req.body.harga ||
      !req.body.kontruksi ||
      !req.body.alamat ||
      !req.body.provinsi ||
      !req.body.kota ||
      !req.body.kabupaten ||
      !req.body.daerah
    ) {
      return res.status(500).json({
        status: false,
        message: "Field must be not null",
      });
    }

    const dataPengajuan = {
      userId: req.user._id,
      okupasiId: req.body.okupasi_id,
      jangkaWaktu: req.body.jangka_waktu,
      harga: req.body.harga,
      kontruksi: req.body.kontruksi,
      alamat: {
        alamat: req.body.alamat,
        provinsi: req.body.provinsi,
        kota: req.body.kota,
        kabupaten: req.body.kabupaten,
        daerah: req.body.daerah,
      },
      gempa: req.body.gempa,
    };

    // CREATE DATA FOR PENGAJUAN
    const pengajuan = await PengajuanAsuransi.create(dataPengajuan);

    if (!pengajuan) {
      return res.status(500).json({
        status: false,
        message: "Error create data pengajuan.",
      });
    }

    const dataOkupasi = await Okupasi.findById(dataPengajuan.okupasiId);

    // KETIKA BERHASIL MENGAJUKAN FORM, BUAT INVOICE BERDASARKAN DATA INVOICE NOMOR TERAKHIR
    const runningDataInvoice = await Invoice.find()
      .sort({ nomorInvoice: -1 })
      .limit(1);
    const invoice = new Invoice();
    invoice.pengajuanAsuransi = pengajuan._id;
    invoice.nomorInvoice =
      "K.001." +
      getRandomNumbers(
        runningDataInvoice.length < 1
          ? 1
          : parseInt(
              runningDataInvoice[0].nomorInvoice
                .split(".")
                .reverse("")
                .join(".")
                .substr(0, 5)
                .replace(/(^|[^0-9])(0+)([1-9]+)/g, "$1$3")
            ) + 1
      );
    invoice.biayaAdministrasi = parseFloat(10000);
    invoice.biayaPremiDasar = parseFloat(
      ((dataPengajuan.harga * dataOkupasi.nilaiPremi) / 1000) *
        dataPengajuan.jangkaWaktu
    );
    invoice.totalInvoice = parseFloat(
      +invoice.biayaAdministrasi + +invoice.biayaPremiDasar
    );
    invoice.keterangan = "Belum Bayar";
    await invoice.save();

    return res.status(200).json({
      status: true,
      message: "Pengajuan berhasil dikirim",
      data: pengajuan,
    });
    return;
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.get = async (req, res) => {
  try {
    const data_total = await PengajuanAsuransi.find();
    var per_page = 10;
    if (typeof req.query.per_page !== "undefined") {
      per_page = parseInt(req.query.per_page);
    }
    var page = 0;
    var current_page = 1;
    if (typeof req.query.page !== "undefined") {
      page = parseInt((req.query.page - 1) * per_page);
      current_page = parseInt(req.query.page);
    }
    if (per_page > 0) {
      total_page = Math.ceil(data_total.length / per_page);
    } else {
      total_page = 1;
    }

    const datas = await PengajuanAsuransi.find()
      .populate("okupasiId")
      .skip(page)
      .limit(per_page);
    let dataView = [];
    for (const data of datas) {
      const invoice = await Invoice.findOne({
        pengajuanAsuransi: Object(data._id),
      });
      const dataPolis = await Polis.findOne({
        dataPengajuan: Object(data._id),
      });
      dataView.push({
        _id: data._id,
        noPolis: dataPolis ? dataPolis.noPolis : "Belum Terbit",
        tipeAsuransi: data.tipeAsuransi,
        invoice: invoice,
        jenisPenanggungan: dataPolis
          ? dataPolis.jenisPenanggungan
          : "Asuransi Kebakaran",
        keterangan: invoice.keterangan,
        status: data.status,
      });
    }
    return res.status(200).json({
      status: true,
      message: "success mendapatkan data",
      page: current_page,
      limit: per_page,
      total_page: total_page,
      total_data: datas.length,
      data: dataView,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.invoice = async (req, res) => {
  try {
    const { id } = req.params;
    const pengajuan = await PengajuanAsuransi.findOne({ _id: id }).populate(
      "okupasiId"
    );
    if (!pengajuan) {
      return res.status(404).json({
        status: false,
        message: "data tidak ditemukan",
      });
    }
    const history_transaction = await Invoice.findOne({
      pengajuanAsuransi: Object(pengajuan._id),
    });
    const data = {
      _id: pengajuan._id,
      tipeAsuransi: pengajuan.tipeAsuransi,
      okupasiId: pengajuan.okupasiId._id,
      okupasi: pengajuan.okupasiId.nama,
      noInvoice: history_transaction.invoice,
      periode: pengajuan.jangkaWaktu,
      harga: pengajuan.harga,
      total: parseFloat(history_transaction.total),
      keterangan: history_transaction.keterangan,
    };
    return res.status(200).json({
      status: true,
      message: "succes mendapatkan data",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.bayar = async (req, res) => {
  try {
    const { id } = req.params;
    const bayar = await Invoice.findOne({ pengajuanAsuransi: Object(id) });
    bayar.keterangan = "Sudah Dibayar";
    await bayar.save();
    return res.status(200).json({
      status: true,
      message: "transaksi succes",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// ADMIN FLOW

exports.list = async (req, res) => {
  try {
    const data_total = await PengajuanAsuransi.find();
    var per_page = 10;
    if (typeof req.query.per_page !== "undefined") {
      per_page = parseInt(req.query.per_page);
    }
    var page = 0;
    var current_page = 1;
    if (typeof req.query.page !== "undefined") {
      page = parseInt((req.query.page - 1) * per_page);
      current_page = parseInt(req.query.page);
    }
    if (per_page > 0) {
      total_page = Math.ceil(data_total.length / per_page);
    } else {
      total_page = 1;
    }

    const datas = await PengajuanAsuransi.find()
      .populate("okupasiId")
      .populate("userId")
      .skip(page)
      .limit(per_page)
      .sort({ createdAt: -1 });
    let dataView = [];
    for (const data of datas) {
      const transaksi = await Invoice.findOne({
        pengajuanAsuransi: Object(data._id),
      });
      dataView.push({
        _id: data._id,
        nama: data.userId.nama,
        alamat: data.alamat.alamat,
        tipeAsuransi: data.tipeAsuransi,
        okupasi: data.okupasiId.nama,
        total: parseFloat(transaksi.totalInvoice),
        invoice: transaksi.nomorInvoice,
        keterangan: transaksi.keterangan,
        status: data.status,
      });
    }
    return res.status(200).json({
      status: true,
      message: "success mendapatkan data",
      page: current_page,
      limit: per_page,
      total_page: total_page,
      total_data: datas.length,
      data: dataView,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const pengajuan = await PengajuanAsuransi.findOne({ _id: id })
      .populate("okupasiId")
      .populate("userId", "nama email");
    if (!pengajuan) {
      return res.status(404).json({
        status: false,
        message: "data tidak ditemukan",
      });
    }
    const history_transaction = await Invoice.findOne({
      pengajuanAsuransi: Object(pengajuan._id),
    });
    const data = {
      _id: pengajuan._id,
      user: pengajuan.userId,
      alamat: pengajuan.alamat,
      noPolis: pengajuan.noPolis,
      kontruksi: pengajuan.kontruksi,
      jangkaWaktu: pengajuan.jangkaWaktu,
      tipeAsuransi: pengajuan.tipeAsuransi,
      okupasi: pengajuan.okupasiId.nama,
      noInvoice: history_transaction.nomorInvoice,
      periode: pengajuan.jangkaWaktu,
      harga: pengajuan.harga,
      gempa: pengajuan.gempa,
      total: parseFloat(history_transaction.totalInvoice),
      keterangan: history_transaction.keterangan,
    };
    return res.status(200).json({
      status: true,
      message: "succes mendapatkan data",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.approval = async (req, res) => {
  try {
    const id = req.body.id;
    const status = req.body.status;
    const updateStatus = {
      status: status,
    };
    if (status === "disetujui") {
      const invoice_data = await Invoice.findOne({
        pengajuanAsuransi: Object(id),
      });
      const runningDataPolis = await Polis.find()
        .sort({ noPolis: -1 })
        .limit(1);
      const generateNoPolis =
        "K.01.001." +
        getRandomNumbers(
          runningDataPolis.length < 1
            ? 1
            : parseInt(
                runningDataPolis[0].noPolis
                  .split(".")
                  .reverse("")
                  .join(".")
                  .substr(0, 5)
                  .replace(/(^|[^0-9])(0+)([1-9]+)/g, "$1$3")
              ) + 1
        );
      const dataPolish = {
        dataPengajuan: id,
        dataInvoice: invoice_data._id,
        noPolis: generateNoPolis,
        // tanggal_cetak: new Date(),
      };
      await Polis.create(dataPolish);
      await Pengajuan.updateOne(
        { _id: Object(id) },
        {
          $set: updateStatus,
        }
      );
    }

    return res.status(200).json({
      status: true,
      message: "success update status",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
