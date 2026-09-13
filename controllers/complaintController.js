const Complaint = require('../models/Complaint');

// ----------------------------------------------------
// POST - Submit a new complaint
// ----------------------------------------------------
exports.createComplaint = async (req, res) => {
  try {
    const { studentId, studentName, description } = req.body;

    // Input validation
    if (!studentId || studentId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    if (!studentName || studentName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Student name is required'
      });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Complaint description is required'
      });
    }

    if (description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Complaint must contain at least 5 characters'
      });
    }

    if (description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Complaint cannot exceed 500 characters'
      });
    }

    const complaint = new Complaint({
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      description: description.trim()
    });

    const savedComplaint = await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: savedComplaint
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Unable to submit complaint',
      error: error.message
    });
  }
};

// ----------------------------------------------------
// GET - Get all complaints
// ----------------------------------------------------
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve complaints',
      error: error.message
    });
  }
};

// ----------------------------------------------------
// GET - Get complaints belonging to one student
// ----------------------------------------------------
exports.getStudentComplaints = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const complaints = await Complaint.find({
      studentId: studentId
    }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve complaints',
      error: error.message
    });
  }
};

// ----------------------------------------------------
// GET - Get a single complaint
// ----------------------------------------------------
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve complaint',
      error: error.message
    });
  }
};