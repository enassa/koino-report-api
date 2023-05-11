const ReportSchema = require("../models/Reportmodel");
const mongoose = require("mongoose");
// const getConnection = require("../app");
const express = require("express");
const router = express.Router();
const reader = require("xlsx");
const excelToJson = require("convert-excel-to-json");
var path = require("path");
var root = path.dirname(require.main.filename);
var tmp = require("tmp");
var fs = require("fs");
const multer = require("multer");
// const { response } = require("express");
const { file } = require("tmp");
const PDFJS = require("pdfjs");
let Reports;
const ConnectDB = require("./DBCOnnection");
const { mongPath } = require("../constants");
const admin = require("firebase-admin");
const Busboy = require("busboy");
const os = require("os");

// Display list of all Genre.
exports.uploadReportCards = function (req, res) {
  const alls = [];
  const extraInfo = JSON.parse(req.body.extraInfo);
  const schoolCode = extraInfo.schoolCode;
  const schoolName = extraInfo.schoolName;
  const className = extraInfo.className;
  const semester = extraInfo.semester;
  const formNumber = extraInfo.formNumber;
  const graduationYear = extraInfo.className.split("_")[2];
  try {
    // module.exports = Students;
    const successUploads = [];
    const failedUploads = [];
    const saveFile = (singleFile) => {
      // =========== Get unique id and create a new file name ========
      const fileUniqueID = singleFile?.name?.slice(17, 27);
      const newFileName = `${graduationYear}_${formNumber}_${semester}_${fileUniqueID}.pdf`;
      let filePath = `${__dirname}/uploads/${newFileName}`;

      // ============= Check if file exist on disk ============
      let fileExist = fs.existsSync(filePath);
      if (fileExist) {
        failedUploads.push({
          name: singleFile.name,
          error: "File already exist",
          nameOndisk: newFileName,
        });
        return;
      } else {
        // ========== Save file if file does not exist
        singleFile.mv(filePath, async (error) => {
          try {
            if (error) {
              return res.status(200).send({
                error: error.message,
                message:
                  "Could not save file, probably coul dnot find storage location",
                ok: true,
                succes: false,
              });
            }

            //=========== Check if file information exist in DB ===================
            const report = await Reports.findOne({ File_Name: newFileName });
            if (report) {
              failedUploads.push({
                name: singleFile.name,
                error: "File already exist",
                nameOndisk: newFileName,
              });
              console.log("found file");
              return;
            }

            console.log("creating data in db", fileUniqueID);
            // ====================== Save file information in DB ==========
            await Reports.create({
              Unique_Id: fileUniqueID,
              Graduation_Year: graduationYear,
              FormNumber: formNumber,
              Semester: semester,
              File_Name: newFileName,
              AmountPaid: 0,
              DownloadCount: 0,
              AccessExpiry: Date.now(),
              DownloadsLeft: true,
              Locked: true,
            });
            successUploads.push({
              name: singleFile.name,
              nameOndisk: newFileName,
            });
            console.log("successUploads", successUploads);
          } catch (error) {
            failedUploads.push({
              name: singleFile.name,
              reason: error.message,
              nameOndisk: newFileName,
            });
          }
        });
      }
    };

    const SaveReports = () => {
      // ======= End upload process if there are no fils ==========
      if (req.files === null) {
        return res.status(400);
      }
      // Loop though the files and process each for uploading
      req.files.files.map((myFile) => {
        saveFile(myFile);
      });
      res.status(201).json({
        data: { uploaded: [...successUploads], faiiledUploads: failedUploads },
        extraInfo,
        success: true,
        status: 201,
      });
    };

    // ======================= Connect file information DB ========================
    let connectionUrl = `${mongPath}/${schoolCode}_${schoolName}`;
    let connected = mongoose.connect(connectionUrl);
    mongoose.Promise = global.Promise;
    connected.then(() => {
      const con = mongoose.createConnection(connectionUrl);
      con.on("open", () => {
        mongoose.connection.db
          .listCollections({ name: "reports_" + className })
          .next(async (err, names) => {
            // ======= check if a report collection exist for the year =======
            if (names) {
              console.log("exist");
              SaveReports();
            } else {
              console.log("does not exist");
              Reports = mongoose.model(
                "reports_" + extraInfo.className,
                ReportSchema
              );
              SaveReports();
            }
          });
      });
    });
  } catch (error) {
    res.status(200).json({
      error: error.message,
      success: false,
      status: 200,
    });
  }
};

exports.getReportList = async function (req, res) {
  const { Unique_Id, schoolCode, schoolName, className } = req.body;
  const collectionName = `reports_${className}`;
  console.log(collectionName);
  // return;
  // const Reports = mongoose.model(className, ReportSchema);
  const connection = await ConnectDB(schoolCode, schoolName, collectionName);
  const Reports = mongoose.model(collectionName, ReportSchema);
  console.log(Reports, connection, mongoose.models, Unique_Id);
  const reports = await Reports.find({ Unique_Id });
  console.log(reports, Unique_Id);
  if (reports) {
    res.status(201).json({
      data: reports,
      success: true,
      status: 201,
    });
  }
};

exports.downloadReport = async (req, res) => {
  const {
    Unique_Id,
    Semester,
    FormNumber,
    File_Name,
    schoolCode,
    schoolName,
    Graduation_Year,
    ReportId,
  } = req.body;
  const collectionName = `reports_class_of_${Graduation_Year}`;
  const connection = ConnectDB(schoolCode, schoolName, collectionName);
  // Function to download a file
  var downloadFile = () => {
    const filePath = path.join(__dirname, "uploads", File_Name); // Assuming files are stored in the "uploads" directory
    fs.access(filePath, fs.constants.F_OK, async (err) => {
      if (err) {
        // File not found
        return res.status(404).send("File not found.");
      }

      // Set appropriate headers for file download
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${File_Name}"`
      );

      // Create a read stream from the file and pipe it to the response
      const fileStream = fs.createReadStream(filePath);
      await fileStream.pipe(res);
    });
  };

  try {
    const Reports = mongoose.model(collectionName, ReportSchema);
    var ObjectId = require("mongodb").ObjectId;
    var o_id = new ObjectId(ReportId);

    const oldReport = await Reports.findOne({ _id: ObjectId(ReportId) });
    if (!oldReport) {
      throw Error("The requested report does not exist");
    }
    const currentDownloadsLeft = oldReport.DownloadsLeft;
    const downloadsCount = oldReport.DownloadCountt;
    let Locked = oldReport.Locked;
    if (Locked || currentDownloadsLeft === 0) {
      throw Error("You do not have access to this report");
      // Hacking attempt
    }
    const newDownloadsLeft = currentDownloadsLeft - 1;
    if (newDownloadsLeft === 0) {
      Locked = true;
    }
    const updateDoc = {
      $set: {
        Locked,
        DownloadsLeft: newDownloadsLeft,
        DownlodCount: downloadsCount + 1,
      },
    };
    // upsert:false means do not create property if it does not exist
    const options = { upsert: false, new: true };
    const report = await Reports.findOneAndUpdate(
      { _id: ReportId },
      updateDoc,
      options
    );
    console.log(report, currentDownloadsLeft, newDownloadsCount);
    await downloadFile();
  } catch (error) {
    res.status(200).json({
      message: error.message,
      success: false,
      status: 200,
    });
  }

  // Reports.findOneAndUpdate;
};
// Display detail page for a specific Genre.
// exports.genre_detail = function (req, res) {
//   res.send("NOT IMPLEMENTED: Genre detail: " + req.params.id);
// };

// Display Genre create form on GET.
// exports.genre_create_get = function (req, res) {
//   res.send("NOT IMPLEMENTED: Genre create GET");
// };
// const getPdfText = async (path) => {
//   const pdf = await PDFJS.getDocument(path);

//   const pagePromises = [];
//   for (let j = 1; j <= pdf.numPages; j++) {
//     const page = pdf.getPage(j);

//     pagePromises.push(
//       page.then((page) => {
//         const textContent = page.getTextContent();
//         return textContent.then((text) => {
//           return text.items.map((s) => s.str).join("");
//         });
//       })
//     );
//   }

//   const texts = await Promise.all(pagePromises);
//   return texts.join("");
// };

// Function to handle file uploads

// Express route handler for file upload
exports.uploadFileToFirebase = (req, res) => {
  // Initialize Firebase Admin SDK
  const firebaseConfig = {
    apiKey: "AIzaSyCVxc6xzt6EDgyGKiAwSeDZqkXu9Q_Ha8Q",
    authDomain: "koinoreport-6e006.firebaseapp.com",
    projectId: "koinoreport-6e006",
    storageBucket: "koinoreport-6e006.appspot.com",
    messagingSenderId: "491050722928",
    appId: "1:491050722928:web:860f184131a446749e36b5",
    measurementId: "G-15BVY9ZZVP",
  };
  admin.initializeApp(firebaseConfig);
  // admin.initializeApp({
  //   credential: admin.credential.applicationDefault(),
  //   storageBucket: "your-storage-bucket-url",
  // });

  const bucket = admin.storage().bucket();

  // Connect to MongoDB
  mongoose.connect("mongodb://localhost:27017/fileuploads", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const FileSchema = new mongoose.Schema({
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    createdAt: { type: Date, default: Date.now },
  });

  const File = mongoose.model("File", FileSchema);

  const busboy = Busboy({ headers: req.headers });
  console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvv");

  function uploadFileToFirebaseStorage(file, filename) {
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

    return new Promise((resolve, reject) => {
      const filePath = path.join(os.tmpdir(), filename);
      const writeStream = fs.createWriteStream(filePath);

      file
        .pipe(writeStream)
        .on("finish", () => {
          bucket
            .upload(filePath, { destination: filename })
            .then(() => {
              fs.unlink(filePath, (error) => {
                if (error) {
                  console.error("Error deleting temporary file:", error);
                }
              });

              // Save file details to MongoDB
              const newFile = new File({
                filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
              });

              newFile.save((error) => {
                if (error) {
                  reject(error);
                } else {
                  resolve();
                }
              });
            })
            .catch((error) => {
              reject(error);
            });
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }
  console.log("hhhhhhhhhhhhhhhhhhhhhhh");
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    // Handle the file upload here
    console.log("nnnnnnnnnnnnnnnnnnnnnnnnn");
    uploadFileToFirebaseStorage(file, filename)
      .then(() => {
        res.status(200).json({ message: "File uploaded successfully" });
      })
      .catch((error) => {
        res
          .status(500)
          .json({ error: "Failed to upload file", message: error.message });
      });
  });
  // return;
  req.pipe(busboy);
};
