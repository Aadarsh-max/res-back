import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import Resume from "../models/Resume.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const createResume = async (req, res) => {
  try {
    const { title } = req.body;

    const defaultResumeData = {
      profileInfo: {
        profileImg: null,
        previewUrl: "",
        fullName: "",
        designation: "",
        summary: "",
      },
      contactInfo: {
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
      },
      workExperience: [
        {
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
      education: [
        {
          degree: "",
          institution: "",
          startDate: "",
          endDate: "",
        },
      ],
      skills: [
        {
          name: "",
          progress: 0,
        },
      ],
      projects: [
        {
          title: "",
          description: "",
          github: "",
          liveDemo: "",
        },
      ],
      certifications: [
        {
          title: "",
          issuer: "",
          year: "",
        },
      ],
      languages: [
        {
          name: "",
          progress: 0,
        },
      ],
      interests: [""],
    };

    const newResume = await Resume.create({
      userId: req.user._id,
      title,
      ...defaultResumeData,
    });
    res.status(201).json(newResume);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create resume", error: error.message });
  }
};

export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({
      updatedAt: -1,
    });
    res.status(200).json({ resumes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create resume", error: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume Not Found" });
    }
    res.json(resume);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create resume", error: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) {
      return res
        .status(404)
        .json({ message: "Resume not found or unauthorized" });
    }

    Object.assign(resume, req.body);

    const savedResume = await resume.save();
    res.json(savedResume);

  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create resume", error: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res
        .status(404)
        .json({ message: "Resume not found or unauthorized" });
    }

    const uploadsFolder = path.join(__dirname, "..", "uploads");

    // Delete thumbnail if it exists
    if (resume.thumbnailLink) {
      const oldThumbnailPath = path.join(
        uploadsFolder,
        path.basename(resume.thumbnailLink)
      );
      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
      }
    }

    // Delete profile preview image if it exists
    if (resume.profileInfo?.previewUrl) {
      const oldProfileImgPath = path.join(
        uploadsFolder,
        path.basename(resume.profileInfo.previewUrl)
      );
      if (fs.existsSync(oldProfileImgPath)) {
        fs.unlinkSync(oldProfileImgPath);
      }
    }

    await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete resume",
      error: error.message,
    });
  }
};

