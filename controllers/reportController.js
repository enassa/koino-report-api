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
let storageAppsCount = 0;

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
      let filePath = `${__dirname}/uploaded/${newFileName}`;

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
            // console.log("successUploads", successUploads);
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
    res.status(500).json({
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
  // try {
  var serviceAccount = require(__dirname + "/accounts/account.json");
  if (storageAppsCount === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      ...firebaseConfig,
    });
    storageAppsCount++;
  }
  const destinationPath = `${schoolCode}_${schoolName}/class_of_${Graduation_Year}/`;

  const bucket = admin.storage().bucket();
  const myFile = bucket.file(destinationPath + File_Name);
  // Function to download a file
  var downloadFile = () => {
    // const filePath = path.join(__dirname, "uploaded", File_Name); // Assuming files are stored in the "uploads" directory
    // fs.access(filePath, fs.constants.F_OK, async (err) => {
    //   if (err) {
    //     // File not found
    //     return res.status(404).send("File not found.");
    //   }

    //   // Set appropriate headers for file download
    //   res.setHeader("Content-Type", "application/octet-stream");
    //   res.setHeader(
    //     "Content-Disposition",
    //     `attachment; filename="${File_Name}"`
    //   );

    //   // Create a read stream from the file and pipe it to the response
    //   const fileStream = fs.createReadStream(filePath);
    //   await fileStream.pipe(res);
    // });

    const readStream = myFile.createReadStream();
    console.log(readStream);

    res.setHeader("Content-Type", "application/pdf"); // Set the content type to PDF
    res.setHeader("Content-Disposition", `attachment; filename=${File_Name}`); // Specify the desired filename for the downloaded file
    // res.setHeader("Content-Disposition", "attachment; filename=file.jpg"); // Specify the desired filename for the downloaded file

    readStream.pipe(res);
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
    if (report) {
      const [exists] = await myFile.exists();
      if (exists) {
        await downloadFile();
      } else {
        res.status(200).json({
          status: 200,
          message: "File already exist",
          success: false,
        });
      }
    }
  } catch (error) {
    res.status(200).json({
      message: error.message,
      success: false,
      status: 200,
    });
  }
};

// Express route handler for file upload
exports.uploadFileToFirebase = async (req, res) => {
  var admin = require("firebase-admin");

  const extraInfo = JSON.parse(req.body.extraInfo);
  const schoolCode = extraInfo.schoolCode;
  const schoolName = extraInfo.schoolName;
  const className = extraInfo.className;
  const semester = extraInfo.semester;
  const formNumber = extraInfo.formNumber;
  const graduationYear = extraInfo.className.split("_")[2];

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
  try {
    var serviceAccount = require(__dirname + "/accounts/account.json");
    if (storageAppsCount === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        ...firebaseConfig,
      });
      storageAppsCount++;
    }

    const bucket = admin.storage().bucket();

    const collectionName = `reports_class_of_${graduationYear}`;
    const connection = await ConnectDB(schoolCode, schoolName, collectionName);
    const Reports = mongoose.model("reports_" + className, ReportSchema);
    const successUploads = [];
    const failedUploads = [];
    function uploadFileToFirebaseStorage(
      singleFile,
      filename,
      filePath,
      fileUniqueID,
      isLast,
      counter
    ) {
      const destinationPath = `${schoolCode}_${schoolName}/${className}/`;
      return new Promise((resolve, reject) => {
        singleFile.mv(filePath, async (error) => {
          const myFile = bucket.file(destinationPath + filename);
          const [exists] = await myFile.exists();
          if (exists) {
            failedUploads.push({
              name: singleFile.name,
              error: "File already exist",
              nameOndisk: filename,
            });

            console.log("file exist");
            resolve({});
            return;
          }
          bucket
            .upload(filePath, { destination: destinationPath + filename })
            .then(async () => {
              fs.unlink(filePath, (error) => {
                if (error) {
                  console.error("Error deleting temporary file:", error);
                }
              });

              //=========== Check if file information exist in DB ===================
              const report = await Reports.findOne({ File_Name: filename });
              if (report) {
                failedUploads.push({
                  name: singleFile.name,
                  error: "File already exist",
                  nameOndisk: filename,
                });
                console.log("file records exist in mongodb");
                return;
              }

              await Reports.create({
                Unique_Id: fileUniqueID,
                Graduation_Year: graduationYear,
                FormNumber: formNumber,
                Semester: semester,
                File_Name: filename,
                AmountPaid: 0,
                DownloadCount: 0,
                AccessExpiry: Date.now(),
                DownloadsLeft: true,
                Locked: true,
              });
              successUploads.push({
                name: singleFile.name,
                nameOndisk: filename,
              });
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        });
      });
    }
    if (req.files === null) {
      return res.status(400);
    }
    let counter = 0;
    const saveReports = async () => {
      req.files.files.map(async (singleFile, index) => {
        const fileUniqueID = singleFile?.name?.slice(17, 27);
        const newFileName = `${graduationYear}_${formNumber}_${semester}_${fileUniqueID}.pdf`;
        let filePath = `${__dirname}/uploads/${newFileName}`;
        const isLast = counter === req.files.files.length;
        await uploadFileToFirebaseStorage(
          singleFile,
          newFileName,
          filePath,
          fileUniqueID,
          isLast,
          counter - 1
        )
          .then(() => {
            if (counter + 1 === req.files.files.length) {
              res.status(201).json({
                data: { uploaded: [...successUploads], failedUploads },
                extraInfo,
                success: true,
                status: 201,
              });
            }
            counter = counter + 1;
          })
          .catch((error) => {
            if (counter + 1 === req.files.files.length) {
              res.status(201).json({
                data: { uploaded: [...successUploads], failedUploads },
                extraInfo,
                success: true,
                status: 201,
              });
            }
            counter = counter + 1;
          });
        // console.log(isLast);

        // Handle the file upload here
      });
    };
    saveReports();
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      status: 500,
    });
  }
};
