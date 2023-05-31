//studentserver.js

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require("glob")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('./public'));

/**
 * Create a new student resource.
 * This method receives a HTTP POST request with a JSON containing the
 * student data (first name, last name, GPA, and enrollment status). it checks 
 * if a duplicate record exist, if there is a duplicate it returns an error else
 * It generates a unique ID for the new resource, saves the data to a JSON file, and returns
 * a response indicating success.
 * @method post /student
 * @param req the HTTP request object
 * @param res the HTTP response object
 * @throws IOException if an error occurs while writing to the file
 * @return the HTTP response object with a JSON payload containing the ID and
 */
app.post('/students', async function(req, res) {
  var record_id = new Date().getTime();
  var found = false
  var rsp_obj = {};
  var obj = {};
  obj.record_id = record_id;
  obj.first_name = req.body.first_name;
  obj.last_name = req.body.last_name;
  obj.gpa = req.body.gpa;
  obj.enrolled = req.body.enrolled;

  var str = JSON.stringify(obj, null, 2);
  try{
  var arr =  await duplicates(obj.last_name);
  duplicatesarr = arr.students
  
  
  duplicatesarr.forEach(student => {
    
    if(student.last_name == obj.last_name && 
      student.first_name == obj.first_name && 
      student.gpa == obj.gpa && 
      student.enrolled== obj.enrolled)
    {
      found = true
      rsp_obj = {'error - Duplicate Exist For This Student': {obj}};
    }
  });

  

  if(found == false){
    fs.writeFile("students/" + record_id + ".json", str, function(err) {
      if(err) {
        rsp_obj.record_id = -1;
        rsp_obj.message = 'error - unable to create resource';
        return res.status(200).send(rsp_obj);
      } else {
        rsp_obj.record_id = record_id;
        rsp_obj.message = 'successfully created';
        return res.status(201).send(rsp_obj);
      }
    }); //end writeFile method
}
  return res.status(409).send(rsp_obj);
}
catch(error){
  console.log(error)
}
}); //end post method


/**
 * This method handles GET requests for retrieving a student's record from the "students" directory.
 * the Get request should pass the student ID in the URL as params and it will return the details of the 
 * student with matching student ID. 
 * @method get /students/:record_id
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} Returns the requested student's record if found, or an error message if not found.
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


/**
 * Reads the content of multiple JSON files and parses their content into an array.
 * @param {Array} files - The array of filenames to be read.
 * @param {Array} arr - The array to store the parsed content of the files.
 * @param {Object} res - The response object to be sent back to the client.
 * @returns {Object} - Returns an object with a "students" property that contains the parsed content of the JSON files.
*/
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

/**
 * Retrieves all student records stored as JSON files in the "students" directory and sends them as a response with a status of 200.
 * @method get /students
 * @param req the HTTP request object
 * @param res the HTTP response object
 * @return nothing
 * @throws nothing
*/
app.get('/students', function(req, res) {
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
 * Updates the student record with the specified record_id. The put request should
 *  pass the student ID in the URL as params of the student that we want to update.
 * @method put /students/:record_id
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} - The updated student record or an error message.
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
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    }

  });

}); //end put method

/**
 * Deletes the student record with the specified ID. The delete request should
 * pass the student ID in the URL as params of the student that we want to delete.
 * @method delete /students/:record_id
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} The response object containing the status and message of the operation.
 * @throws {Error} If an internal server error occurs during the operation.
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




/**
* This method takes a lname (string) as a param and pass 
* that to duplicate function which search all the student last name and return 
* the ones that matches and then this method return the json of all matching last names.
* @method delete /students/:record_id
* @param {object} req - The request object.
* @param {object} res - The response object.
* @returns {object} The response object containing the status and message of the operation.
* @throws {Error} If an internal server error occurs during the operation.
*/
app.get('/studentssearch/:lname', async function(req, res) {
    
  var lname = req.params.lname;
    
    var studentsArray =  await duplicates(lname);

    res.status(200).send(studentsArray)

  });

/**
 * This method takes a lname (string) and check for all student based on their last name 
 * if the lname is a match or a substring of a lastname it will return all the object 
 * that matches either of these 2 conditions
 */
async function duplicates(lname) {
  return new Promise((resolve, reject) => {
    var studentsArray = { "students": [] };
    glob("students/*.json", null, function (err, files) {
      if (err) {
        reject(err);
      }
      readAll(files, [], (obj) => {
        var result = obj.students
        result.forEach(student => {
          if (student.last_name.toLowerCase().includes(lname.toLocaleLowerCase())) {
            studentsArray.students.push(student)
          }
        });
        resolve(studentsArray);
      });
    });
  });
}

/**
 * This method takes all file names and read the data 
 * append them into an array and return the array back.  
 * @method readALL 
 * @param {*} files name of all the files
 * @param {*} arr append all the data from the files in this array
 * @param {*} callback the callback function returns arr if no file left to read
 * @returns the array with all files data
 */
function readAll(files, arr, callback) {
  const fname = files.pop();
  if (!fname) {
    const obj = { students: arr };
    callback(obj);
    return;
  }
  fs.readFile(fname, 'utf8', (err, data) => {
    if (err) {
      callback({ message: 'error - internal server error' });
    } else {
      arr.push(JSON.parse(data));
      if (files.length == 0) {
        const obj = { students: arr };
        callback(obj);
      } else {
        readAll(files, arr, callback);
      }
    }
  });
}
  
  

app.listen(5678); //start the server
console.log('Server is running...');