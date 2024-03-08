// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Create an Express application
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // Parse

const dbUser = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.dky6ezp.mongodb.net/usepopcorn?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.log("Failed to connect to MongoDB:", err));

const watchSchema = new mongoose.Schema({
  imdbID: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  year: { type: String, required: true },
  poster: { type: String, required: true },
  runtime: { type: Number },
  imdbRating: { type: Number },
  userRating: { type: Number },
});

const watchedMovie = mongoose.model("WatchedMovie", watchSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Server is running successfully.");
});

app.get("/api/all-movies", (req, res) => {
  watchedMovie
    .find({})
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.log("Error retrieving movies: ", err);
      res
        .status(500)
        .json({ message: "Failed to retrieve movies", error: err });
    });
});

app.post("/api/movies", (req, res) => {
  const movieData = req.body.movie;
  // Process the movie data here (e.g., save it to a database)
  console.log("Received movie data:", movieData);
  res.send({ message: "Movie data received successfully" });

  const newWatchedMovie = new watchedMovie(movieData);
  newWatchedMovie
    .save()
    .then((savedMovie) => {
      console.log("Movie saved:", savedMovie);
    })
    .catch((err) => {
      console.log("Failed to save movie:", err);
    });
});

app.delete("/api/movies/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await watchedMovie.findOneAndDelete({ imdbID: id });
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
