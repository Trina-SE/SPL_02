import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AdminRegistrationPage.css';
import { validateEmail, checkUsernameExists } from '../utils/adminValidation';
import { useNavigate } from 'react-router-dom';

function AdminRegistrationPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        pinCode: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setErrors({
            ...errors,
            [name]: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Check required fields
        if (!formData.username) newErrors.username = "Username is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.pinCode) newErrors.pinCode = "Pin code is required";
        if (!formData.password) newErrors.password = "Password is required";
        if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";

        // Validate passwords
        if (formData.password && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Validate email format
        if (formData.email && !validateEmail(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        // Check if username already exists
        const usernameExists = await checkUsernameExists(formData.username);
        if (usernameExists) {
            newErrors.username = "Username already exists";
        }

        // If there are errors, set the errors state and return
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Create the data object without confirmPassword
        const { username, password, email, pinCode } = formData;
        const data = { username, password, email, pinCode };

        // Submit registration form
        try {
            const response = await axios.post('http://localhost:8000/api/admin/add', data, {
                headers: {
                    'Content-Type': 'application/json' // Specify the content type as JSON
                },
            });

            if (response.data.success) {
                navigate('/'); // Redirect to the homepage on successful registration
            } else {
                setErrors({ form: response.data.error || "An error occurred during registration" });
            }
        } catch (error) {
            console.error(error);
            if (error.response) {
                // Server responded with a status other than 2xx
                setErrors({ form: `Registration failed: ${error.response.data.message || error.response.statusText}` });
            } else if (error.request) {
                // Request was made but no response was received
                setErrors({ form: "No response received from the server. Please try again later." });
            } else {
                // Something happened in setting up the request
                setErrors({ form: "An error occurred during registration. Please try again." });
            }
        }
    };

    return (
        <div className="register-container">
            <h2>Admin Sign Up</h2>
            <form onSubmit={handleSubmit} noValidate>
                <label>Username</label>
                <input 
                    type="text" 
                    name="username" 
                    placeholder="Enter a username..." 
                    value={formData.username} 
                    onChange={handleChange} 
                />
                {errors.username && <p className="error-message">{errors.username}</p>}
                
                <label>Email address</label>
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Enter your email address..." 
                    value={formData.email} 
                    onChange={handleChange} 
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
                
                <label>Pin Code</label>
                <input 
                    type="text" 
                    name="pinCode" 
                    placeholder="Enter your pin code..." 
                    value={formData.pinCode} 
                    onChange={handleChange} 
                />
                {errors.pinCode && <p className="error-message">{errors.pinCode}</p>}
                
                <label>Password</label>
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Enter your password..." 
                    value={formData.password} 
                    onChange={handleChange} 
                />
                {errors.password && <p className="error-message">{errors.password}</p>}
                
                <label>Confirm Password</label>
                <input 
                    type="password" 
                    name="confirmPassword" 
                    placeholder="Enter your password again..." 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                
                <button type="submit">Sign up</button>
                {errors.form && <p className="error-message">{errors.form}</p>}
            </form>
        </div>
    );
}

export default AdminRegistrationPage;
