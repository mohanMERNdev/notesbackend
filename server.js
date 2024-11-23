const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb+srv://mohan:27011997@cluster0.szbw5ym.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "Others", enum: ["Work", "Personal", "Others"] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Note = mongoose.model("Note", noteSchema);


app.post("/api/notes", async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || "Others",
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: "Failed to create note", details: err.message });
  }
});

app.get("/api/notes", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    const notes = await Note.find(query).sort({ created_at: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes", details: err.message });
  }
});

app.put("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = {
      ...req.body,
      updated_at: new Date(),
    };
    const note = await Note.findByIdAndUpdate(id, updatedData, { new: true });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: "Failed to update note", details: err.message });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByIdAndDelete(id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note", details: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
