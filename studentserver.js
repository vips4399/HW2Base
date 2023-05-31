//studentserver.js

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require("glob");
const { type } = require('os');

const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const swaggerOptions = {
  swaggerDefinition:{
    info:{
      title:'Student Server API',
      version:'1.0.0'
    }
  },
  apis:['studentserver.js']

};

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('./public'));

/**
 * @swagger
 * /students:
 *  post:
 *    description: Creates a new student object with all of its attributes.
 *    parameters:
 *    - name: first_name
 *      description: Student's first name
 *      in: formData
 *      required: true
 *      type: String
 *    - name: last_name
 *      description: Student's last name
 *      in: formData
 *      required: true
 *      type: String
 *    - name: gpa
 *      description: Student's gpa
 *      in: formData
 *      required: true
 *      type: String 
 *    - name: enrolled
 *      description: Student's enrolled status
 *      in: formData
 *      required: true
 *      type: String
 *    responses:
 *      200:
 *        description: unable to create resource
 *      201:
 *        description: Success
 */ 
app.post('/students', function(req, res) {//creates a new student obj with all of it's attributes.

  var record_id = new Date().getTime();

  var obj = {};
  obj.record_id = record_id;
  obj.first_name = req.body.first_name;
  obj.last_name = req.body.last_name;
  obj.gpa = req.body.gpa;
  obj.enrolled = req.body.enrolled;

  var str = JSON.stringify(obj, null, 2);
const fs = require('fs');

const dir = 'students';

fs.access(dir, (err) => {
  if (err) {
    fs.mkdir(dir, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Directory created successfully!');
      }
    });
  } else {    
    console.log('Directory already exists!');
  }
  if (checkStudentExists()==false){
    fs.writeFile("students/" + record_id + ".json", str, function(err) {//writes to the students directory
      var rsp_obj = {};
      if(err) {
        rsp_obj.record_id = -1;
        rsp_obj.message = 'error - unable to create resource';
        return res.status(200).send(rsp_obj);
      } else {
        rsp_obj.record_id = record_id;
        rsp_obj.message = 'successfully created';
        return res.status(201).send(rsp_obj);
      }
    }) //end writeFile method
  }else{
    console.log("Student exists")
}
})

  
}); //end post method
/**
 * @swagger
 * /students/:recordid :
 *  get:
 *    description: gets a student by record id.
 *    parameters:
 *    - name: record_id
 *      description: Student's Record ID
 *      in: formData
 *      required: true
 *      type: String
 *    responses:
 *      404:
 *        description: error - resource not found
 *      200:
 *        description: Success
 */ 
 app.get('/students/:record_id', function(req, res) {
  var record_id = req.params.record_id;

  fs.readFile("students/" + record_id + ".json", "utf8", function(err, data) {
    if (err) {
      var rsp_obj = {};
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    } else {
      return res.status(200).send(data);
    }
  });
}); 

function readFiles(files,arr,res) {
  fname = files.pop();
  if (!fname)
    return;
  fs.readFile(fname, "utf8", function(err, data) {
    if (err) {
      return res.status(500).send({"message":"error - internal server error"});
    } else {
      arr.push(JSON.parse(data));
      if (files.length == 0) {
        var obj = {};
        obj.students = arr;
        return res.status(200).send(obj);
      } else {
        readFiles(files,arr,res);
      }
    }
  });  
}
// app.get('/students/:record_id', function(req, res) {
//   var record_id = req.params.record_id;

//   fs.readFile("students/" + record_id + ".json", "utf8", function(err, data) {
//     if (err) {
//       var rsp_obj = {};
//       rsp_obj.record_id = record_id;
//       rsp_obj.message = 'error - resource not found';
//       return res.status(404).send(rsp_obj);
//     } else {
//       return res.status(200).send(data);
//     }
//   });
// }); 
// /**
//  * Reads all the student files from the `students` directory and returns them as an array of objects.
//  *
//  * @param {Array<string>} files - An array of file names.
//  * @param {Array<Object>} arr - An array of student objects.
//  * @param {Object} res - Express response object.
//  */
// function readFiles(files,arr, res) {
//   console.log(files.length)
//   fname = files.pop();
//   if (!fname)
//     return;
//   fs.readFile(fname, "utf8", function(err, data) {
//     if (err) {
//       return res.status(500).send({"message":"error - internal server error"});
//     } else {
//       arr.push(JSON.parse(data));
//       if (files.length == 0) {
//         console.log("before recursion")
//         // console.log(arr)
//         var obj = {};
//         obj.students = arr;
//         checkStudentExists(files, obj, res)
//         // console.log("after recursion")
//         // console.log(arr)
//         return res.status(200).send(obj);
//       } else {
//         //console.log("before readFiles")
//         readFiles(files,arr,res);
//       }
//       //console.log("after readFiles")

//      // console.log(arr)

//     }
//   });  
// } 
/**
 * @swagger
 * /students:
 *  get:
 *    description: get array of all students
 *    responses:
 *      500:
 *        description: error - internal server error
 */ 
app.get('/students', function(req, res) {
  console.log("get students")
  var obj = {};
  var arr = [];
  filesread = 0;

  glob("students/*.json", null, function (err, files) {
    if (err) {
      return res.status(500).send({"message":"error - internal server error"});
    }
    readFiles(files,[],res);
  });

});
/**
 * @swagger
 * /students:record_id :
 *  put:
 *    description: updates existing student by record ID.
 *    parameters:
 *    - name: record_id
 *      description: Student's record ID
 *      in: formData
 *      required: true
 *      type: String
 *    - name: first_name
 *      description: Student's first name
 *      in: formData
 *      required: true
 *      type: String
 *    - name: last_name
 *      description: Student's last name
 *      in: formData
 *      required: true
 *      type: String
 *    - name: gpa
 *      description: Student's gpa
 *      in: formData
 *      required: true
 *      type: String 
 *    - name: enrolled
 *      description: Student's enrolled status
 *      in: formData
 *      required: true
 *      type: String
 *    responses:
 *      200:
 *        description: error - unable to update resource
 *      201:
 *        description: Success
 *      404:
 *        description: error - resource not found
 */ 
app.put('/students/:record_id', function(req, res) {
  var record_id = req.params.record_id;
  var fname = "students/" + record_id + ".json";
  var rsp_obj = {};
  var obj = {};

  obj.record_id = record_id;
  obj.first_name = req.body.first_name;
  obj.last_name = req.body.last_name;
  obj.gpa = req.body.gpa;
  obj.enrolled = req.body.enrolled;

  var str = JSON.stringify(obj, null, 2);

  //check if file exists
  fs.stat(fname, function(err) {
    if(err == null) {

      //file exists
      fs.writeFile("students/" + record_id + ".json", str, function(err) {
        var rsp_obj = {};
        if(err) {
          rsp_obj.record_id = record_id;
          rsp_obj.message = 'error - unable to update resource';
          return res.status(200).send(rsp_obj);
        } else {
          rsp_obj.record_id = record_id;
          rsp_obj.message = 'successfully updated';
          return res.status(201).send(rsp_obj);
        }
      });
      
    } else {
      rsp_obj.record_id = record_id;const fs = require('fs');
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    }

  });

}); //end put method

/**
 * @swagger
 * /students:record_id :
 *  delete:
 *    description: Deletes a from the student directory by their record ID.
 *    parameters:
 *    - name: record_id
 *      description: Student's Record ID
 *      in: formData
 *      required: true
 *      type: String
 *    responses:
 *      200:
 *        description: record deleted
 *      404:
 *        description: error - resource not found
 */ 
app.delete('/students/:record_id', function(req, res) {
  var record_id = req.params.record_id;
  var fname = "students/" + record_id + ".json";

  fs.unlink(fname, function(err) {
    var rsp_obj = {};
    if (err) {
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    } else {
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'record deleted';
      return res.status(200).send(rsp_obj);
    }
  });
  

}); //end delete method

function checkStudentExists(files,obj,fname,lname, res) {
  console.log("checkStudentExists")
  listOfStudents = obj;
  for (let recordId in listOfStudents) {
    let student = listOfStudents[recordId];
    if (student.first_name === firstName && student.last_name === lastName) {
      return true;
    }
  }
  return false;
  
} 

app.listen(5678); //start the server
//console.log(checkStudentExists("John","Doe",))
console.log('Server is running...');