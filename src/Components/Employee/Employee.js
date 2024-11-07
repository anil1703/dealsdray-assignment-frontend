import Container from "react-bootstrap/esm/Container";
import Header from "../Header/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, IconButton, InputAdornment, TextField, Dialog, DialogActions, DialogContent, DialogTitle, TextField as MuiTextField, Select, MenuItem, FormControl, InputLabel, Radio, RadioGroup, FormControlLabel, Checkbox, FormGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

// Styling for the table
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Employee Component
const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    designation: '',
    mobile: '',
    gender: '',
    course: [],
    employeeImage: null,
  });
  const [refresh, setRefresh] = useState(false);

  const jwt_token = Cookies.get("jwt_token");

  useEffect(() => {
    // Fetch employee data from backend
    axios
      .get(`http://localhost:5000/getEmployeeList`, {
        headers: {
          Authorization: `Bearer ${jwt_token}`,
        },
      })
      .then((response) => {
        setEmployee(response.data.response);
        console.log(response.data.response)
      })
      .catch((err) => {
        console.log(err);
      });
  }, [jwt_token,refresh]);

  // Filter employees based on the search query
  const filteredEmployees = employee.filter(emp =>
    emp.f_Name && emp.f_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle modal opening for create
  const handleOpenModal = () => {
    setNewEmployee({
      name: '',
      email: '',
      designation: '',
      mobile: '',
      gender: '',
      course: [],
      employeeImage: null,
    });
    setEditEmployee(null); // For create mode
    setOpenModal(true);
  };

  // Handle modal opening for edit
  const handleEditEmployee = (emp) => {
    setEditEmployee(emp);
    setNewEmployee({
      name: emp.f_Name,
      email: emp.f_Email,
      designation: emp.f_Designation,
      mobile: emp.f_Mobile,
      gender: emp.f_Gender,
      course: emp.f_Course,
      employeeImage: null, // Not used in the form unless updated
    });
    setOpenModal(true);
  };

  // Handle modal closing
  const handleCloseModal = () => setOpenModal(false);

  // Handle input change for the new or edited employee form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: value,
    });
  };

  // Handle file input change for employee image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setNewEmployee({
        ...newEmployee,
        employeeImage: file,
      });
    } else {
      alert("Only JPG and PNG files are allowed.");
    }
  };

  // Handle course checkbox change
  const handleCourseChange = (e) => {
    const { value, checked } = e.target;
    const newCourses = checked
      ? [...newEmployee.course, value]
      : newEmployee.course.filter(course => course !== value);
    setNewEmployee({
      ...newEmployee,
      course: newCourses,
    });
  };

  const uploadImageOnCloudinary = async () => {
    try {
      const formData = new FormData();
      formData.append("file", newEmployee.employeeImage); // use the image file from state
      formData.append("upload_preset", "bar_codes");

      // Upload image to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dafmi9027/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await cloudinaryResponse.json();

      // Check if the upload was successful and return the URL
      if (result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // Handle Create or Update employee
  const handleSaveEmployee = async () => {
    const imageUrl = await uploadImageOnCloudinary();

    if (imageUrl || !newEmployee.employeeImage) {
      const data = {
        f_Id: editEmployee ? editEmployee.f_Id : `Emp-id-${employee.length + 1}`,
        f_Name: newEmployee.name,
        f_Email: newEmployee.email,
        f_Designation: newEmployee.designation,
        f_Mobile: newEmployee.mobile,
        f_Gender: newEmployee.gender,
        f_Course: newEmployee.course,
        f_Image: imageUrl || editEmployee?.f_Image,
      };

      const toastID = toast.loading(editEmployee ? "Updating..." : "Creating...");

      const url = editEmployee ? `http://localhost:5000/updateEmployee/${data.f_Id}` : 'http://localhost:5000/createEmployee';
      const method = editEmployee ? 'put' : 'post';
      const headers = {
        Authorization: `Bearer ${jwt_token}`,
      };

      try {
        const response = await axios[method](url, data, { headers });
        if (response.status === 200) {
          setEmployee(prev => editEmployee ? prev.map(emp => (emp.f_Id === editEmployee.f_Id ? response.data : emp)) : [...prev, response.data]);
          toast.dismiss(toastID);
          toast.success(response.data);
          handleCloseModal();
          setRefresh(prev => !prev); // Refresh list after creating/updating employee
        }
      } catch (err) {
        toast.dismiss(toastID);
        toast.error("Error saving employee");
      }
    } else {
      alert("Image upload failed. Please try again.");
    }
  };

  const handleDeleteEmployee = (id) => {
    const toastID = toast.loading("Deleting...");
    const url = `http://localhost:5000/deleteEmployee/${id}`

    axios.delete(url,{
      headers: {
        Authorization: `Bearer ${jwt_token}`,
      }
    })
    .then((response) => {
      toast.success("Deleted")
      toast.dismiss(toastID)
      setRefresh(prev => !prev)
    })
    .catch((err) => {
      toast.Error("Error while Deleting")
      toast.dismiss(toastID)
    })

    

  }

  return (
    <>
      <Header />
      <Container>
        <div className="EmployeeList" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Employee List</h1>

          {/* Create button with plus icon */}
          <div>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
              style={{ marginRight: '10px' }}
            >
              Create
            </Button>

            {/* Search field with search icon */}
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              style={{ marginRight: '10px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>

        {/* Table to Display Employee Data */}
        <TableContainer style={{ marginTop: "20px" }} component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="employee table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Employee ID</StyledTableCell>
                <StyledTableCell align="right">Image</StyledTableCell>
                <StyledTableCell align="right">Name</StyledTableCell>
                <StyledTableCell align="right">Email</StyledTableCell>
                <StyledTableCell align="right">Designation</StyledTableCell>
                <StyledTableCell align="right">Mobile</StyledTableCell>
                <StyledTableCell align="right">Gender</StyledTableCell>
                <StyledTableCell align="right">Course</StyledTableCell>
                <StyledTableCell align="right">Created Date</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((row) => (
                <StyledTableRow key={row.f_Id}>
                  <StyledTableCell component="th" scope="row">
                    {row.f_Id}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <img src={row.f_Image} alt={row.f_Name} style={{ width: "50px", height: "50px" }} />
                  </StyledTableCell>
                  <StyledTableCell align="right">{row.f_Name}</StyledTableCell>
                  <StyledTableCell align="right">{row.f_Email}</StyledTableCell>
                  <StyledTableCell align="right">{row.f_Designation}</StyledTableCell>
                  <StyledTableCell align="right">{row.f_Mobile}</StyledTableCell>
                  <StyledTableCell align="right">{row.f_Gender}</StyledTableCell>
                 
                  <StyledTableCell align="right">{row.f_Course.join(', ')}</StyledTableCell>
                  <StyledTableCell align="right">{row.f_CreatedData.slice(0,10)}</StyledTableCell>
                  <StyledTableCell align="right">
                    <Button
                      variant="outlined"
                      color="primary"
                      style={{ marginRight: '5px' }}
                      onClick={() => handleEditEmployee(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                     onClick={() => handleDeleteEmployee(row.f_Id)}
                    >
                      Delete
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal for Create or Edit */}
        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>{editEmployee ? "Edit Employee" : "Create Employee"}</DialogTitle>
          <DialogContent>
            {/* Form fields for employee details */}
            <MuiTextField
              label="Name"
              variant="outlined"
              fullWidth
              name="name"
              value={newEmployee.name}
              onChange={handleInputChange}
              style={{ marginBottom: '10px' }}
            />
            <MuiTextField
              label="Email"
              variant="outlined"
              fullWidth
              name="email"
              value={newEmployee.email}
              onChange={handleInputChange}
              style={{ marginBottom: '10px' }}
            />
            <FormControl fullWidth style={{ marginBottom: '10px' }}>
              <InputLabel>Designation</InputLabel>
              <Select
                label="Designation"
                name="designation"
                value={newEmployee.designation}
                onChange={handleInputChange}
              >
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
              </Select>
            </FormControl>
            <MuiTextField
              label="Mobile"
              variant="outlined"
              fullWidth
              name="mobile"
              value={newEmployee.mobile}
              onChange={handleInputChange}
              style={{ marginBottom: '10px' }}
            />
            <FormControl component="fieldset" style={{ marginBottom: '10px' }}>
              <p>Gender</p>
              <RadioGroup
                name="gender"
                value={newEmployee.gender}
                onChange={handleInputChange}
              >
                <FormControlLabel value="Male" control={<Radio />} label="Male" />
                <FormControlLabel value="Female" control={<Radio />} label="Female" />
              </RadioGroup>
            </FormControl>
            <p>Course</p>
            <FormGroup style={{ marginBottom: '10px' }}>
              <FormControlLabel
                control={<Checkbox value="MCA" onChange={handleCourseChange} checked={newEmployee.course.includes("MCA")} />}
                label="MCA"
              />
              <FormControlLabel
                control={<Checkbox value="BCA" onChange={handleCourseChange} checked={newEmployee.course.includes("BCA")} />}
                label="BCA"
              />
              <FormControlLabel
                control={<Checkbox value="BSC" onChange={handleCourseChange} checked={newEmployee.course.includes("BSC")} />}
                label="BSC"
              />
            </FormGroup>
            <p>Image</p>
            <input type="file" onChange={handleFileChange} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveEmployee} color="primary">
              {editEmployee ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Toaster />
    </>
  );
};

export default Employee;
