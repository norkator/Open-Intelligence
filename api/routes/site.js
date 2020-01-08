const moment = require('moment');
const utils = require('../module/utils');
const fs = require('fs');
const {Op} = require('sequelize');
const path = require('path');


function Site(router, sequelizeObjects) {


  /**
   * Get intelligence... test method
   * http://localhost:4300/get/intelligence
   */
  router.get('/get/intelligence', function (req, res) {
    const now = moment();

    let activityData = []; // { y: 'qwerty', a: 100, b: 90 },
    let donutData = [];

    sequelizeObjects.Data.findAll({
      limit: 100,
      attributes: [
        'label',
        'file_name',
        'file_create_date',
      ],
      where: {
        createdAt: {
          [Op.gt]: now.startOf('day').toISOString(true),
          [Op.lt]: now.endOf('day').toISOString(true),
        }
      },
      order: [
        ['createdAt', 'desc']
      ]
    }).then(rows => {
      if (rows.length > 0) {


        // Parse label counts
        rows.forEach(row => {

          const label_ = row.label;

          const labelIndex = donutData.findIndex(function (dataObj) {
            return dataObj.label === label_;
          });

          if (labelIndex === -1) {
            donutData.push({label: label_, value: 1})
          } else {
            donutData[labelIndex].value++;
          }

          // TODO: this donutData is intended to Morris chart: http://jsbin.com/ukaxod/144/embed?js,output

        });

      }
      res.json({
        activity: activityData,
        donut: donutData,

      });
    }).catch(error => {
      res.status(500);
      res.send(error);
    });

  });


  /**
   * Return latest detected object detection image
   * Folder: /output/objec_detection/
   * base64 image data output
   */
  router.get('/get/latest/object/detection/image', function (req, res) {
    const filePath = path.join(__dirname + '../../../' + 'output/object_detection/');
    fs.readdir(filePath, function (err, files) {
      if (err) {
        res.status(500);
        res.send(err);
      }
      let objectDetectionFile = utils.GetNewestFile(files, filePath);
      fs.readFile(filePath + objectDetectionFile, function (err, data) {
        if (err) {
          res.status(500);
          res.send(err);
        }
        res.json({
          'data': 'data:image/png;base64,' + Buffer.from(data).toString('base64')
        });
      });
    });
  });
}

exports.Site = Site;
