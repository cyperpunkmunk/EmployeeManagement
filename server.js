const mysql2 = require('mysql');
const inquirer = require("inquirer");
const db = require("./db/index.js");  
require ("console.table"); 
const util = require("util"); 


//connect to DB 
const connection = mysql2.createConnection({
  host: 'localhost',
  port: 3306,
  // Your MySQL username
  user: 'root',
  // Your MySQL password
  password: 'kenneth1',
  database: 'employees'
});

//connect to the DB and if an error log it
connection.connect(err => {
    if (err) throw err;

    console.log(
        `====================================================================================`
      );
      console.log("\n WELCOME TO YOUR EMPLOYEE MANAGEMENT SYSTEM \n");
      console.log("connected as id " + connection.threadId + "\n");
      console.log(
        `====================================================================================`
      );   
       mainMenu();
  });

  connection.query = util.promisify(connection.query); 

//function for main menu that will ask user questions
function mainMenu() {

    // Prompting user to choose an option 
    inquirer
      .prompt({
        name: "main",
        type: "list",
        message: "MAIN MENU",
        choices: [
          "View all Departments",
          "View all Roles",
          "View all Employees",
          "Add Department",
          "Add a Role",
          "Add Employee",
          "Update employee role",
          "Add Employee Role",
          "Exit",
        ],
      })
      .then((response) => {
        // Switch case depending on user option
        switch (response.main) {
          case "View all Departments":
            return viewAllDepartments();
          case "View all Roles":
            return viewAllRoles();
          case "View all Employees":
            return viewAllEmployees();
            case "Add Department":
            return addDeptartment();
          case "Add Employee":
            return addEmployee();
          case "Update employee role":
            return updateEmployeeRole();
            case "Add Employee Role":
            return addEmployeeRole();
          case "Exit":
            connection.end();

          default:
            mainMenu();
        }
      });
  }


//function to display all departments to user

 async function viewAllDepartments() {

    employees = await connection.query("SELECT * FROM department"); 
    console.log("Viewing All Departments"); 
    console.table(employees); 
    mainMenu(); 
}


//function to display all roles 

async function viewAllRoles() {
    let employees = await connection.query(`SELECT role.id, role.title AS 'Job Title', role.salary AS 'Salary', 
    department.department_name AS 'Department' 
    FROM role INNER JOIN department ON 
    role.department_id = department.id`);
    console.log("Viewing ALL Employee Roles"); 
    console.table(employees); 
    mainMenu();

}


//function to add a department 
async function viewAllEmployees() {
    let employees = await connection.query(`SELECT employee.id, employee.first_name AS 'First Name', employee.last_name , role.title, 
    department.department_name, role.salary
    FROM employee
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id =role.department_id)`);
    console.log("Viewing ALL Employees"); 
    console.table(employees); 
    mainMenu();

}

//function to add a role 
function addEmployeeRole() {
    inquirer
    .prompt([
      {
        type: "input",
        name: "title",
        message: "Please Enter Employee ew role title: ",
      },
      {
        type: "input",
        name: "salary",
        message: "Please enter the salary for the new role:",
       
      },

      {
        name: "department",
        type: "list",
        message: "Which department should this role belong to?",
        choices: departmentList(),
      },
    ])
    .then((res) => {
      connection.query(
        `INSERT INTO role(title, salary, department_id) 
        VALUES
        (?, ?, 
        (SELECT id FROM department WHERE department_name = ?));`,
        [res.title, res.salary, res.department],
        function (err) {
          if (err) throw err;
          console.log(`${res.title} role was succesfully added. \n`);
          mainMenu();
        }
      );
    });
};



//function to add an employee
const addEmployee = () => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "firstName",
          message: "Please enter employees First Name: ",
         
        },
        {
          type: "input",
          name: "lastName",
          message: "Please enter an employee's Last Name:",
        
        },
        {
          name: "role",
          type: "list",
          message: "What is their role: ",
          choices: rolesList(),
        },
       
      ])
      .then((res) => {
        const sql = `INSERT INTO employee(first_name, last_name, role_id) VALUES(?, ?, ? )`;
        connection.query(
          sql,
          [res.firstName, res.lastName, res.role],
          function (err) {
            if (err) throw err;
            console.table(
              `${(res.firstName, res.lastName)} was succesfully added. \n`
            );
            mainMenu();
          }
        );
      });
  };

//function to update an employee role 
function updateEmployeeRole() {
    console.log("employee role updated"); 

}

//adding to department list 
function departmentList() {
    let departmentArr = [];
    connection.query("SELECT department_name FROM department", function (
      err,
      res
    ) {
      if (err) throw err;
      res.forEach((role) => {
        departmentArr.push(role.department_name);
      });
    });
    return departmentArr;
  }
//function to add a Department 
  function addDeptartment() {
    inquirer
      .prompt({
        name: "department",
        type: "input",
        message: "What department would you like to add?",
      })
      .then(function (res) {
        connection.query(
          "INSERT INTO department SET ?",
          { department_name: res.department },
          function (err) {
            if (err) throw err;
            console.log(`${res.department} department was succesfully added. \n`);
            mainMenu();
          }
        );
      });
  };
  function rolesList() {
    let roleArray = [];
    connection.query("SELECT * FROM role", function (err, res) {
      if (err) throw err;
      res.forEach((role) => {
        roleArray.push(role.title);
      });
    });
    return roleArray;
  }
  

//creates exports connection to db
module.exports = connection; 