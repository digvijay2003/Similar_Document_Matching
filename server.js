const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const Document = require('./models/document');
const multer = require('multer');
const User = require('./models/user');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const isLoggedIn = require('./middleware');
const session = require('./config/session');

const app = express();

// Connect to MongoDB
connectDB();

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(session);

const storage = multer.diskStorage({
  destination: 'uploads/', 
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const allowedMimeTypes = ['image/png', 'image/jpeg','image/gif','image/bmp','image/webp'];

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);  // Accept the file
    } else {
      cb(new Error('Only PNG and JPG images are allowed!'), false);
    }
  }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const {username, password} = req.body;

  // Validate user input
  if (!username || !password) {
    return res.status(400).send('Please fill in all fields');
  }

  try {
    const user = await User.findOne({ username }).select('+password'); // Include password for comparison
    if (!user) {
      return res.status(401).send('Invalid username or password');
    }
    console.log(user);

    const isMatch = await user.comparePassword(password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).send('wwww');
    }

    // req.session.isLoggedIn = true; // Set session variable for authentication
    // req.session.userId = user._id; // Store user ID in session
    res.redirect('/docs'); // Or redirect to protected route
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


app.get('/register', (req, res) => {
  res.render('register'); // Render the register.ejs template
});

app.post('/register', async (req, res) => {

  const {username, password} = req.body;
  // Validate user input
  if (!username || !password) {
    return res.status(400).send('Please fill in all fields');
  }
  // Check for existing username
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }

  // Hash password before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user
  const newUser = new User({username,password: hashedPassword,});

  try {
    await newUser.save();
    res.redirect('/docs') // Or redirect to /docs
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/docs', async (req, res) => {
  res.render('upload');
});

app.get('/home', async (req, res) => {
    const documents = await Document.find();
    res.render('index', { documents})
});


const { exec } = require('child_process');

app.post('/check-document', (req, res) => {
  const pythonScriptPath = 'C:\\Users\\DIGVIJAY\\OneDrive\\Desktop\\doc fraud\\Similar_Document_Template_Matching_Algorithm-master\\MAIN\\Main.py'; // Adjust the path to your Python script
  const uploadedFilePath = `"${req.file.path}"`;

  exec(`python "${pythonScriptPath}" ${uploadedFilePath}`, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          return res.status(500).send('Error occurred while checking document');
      }
      if (stderr) {
          console.error(`Python script error: ${stderr}`);
          return res.status(500).send('Error occurred while checking document');
      }

      const result = stdout.trim(); // Trim whitespace from the output
      // Pass result to .ejs template
      res.render('result', { result });
  });
});

app.post('/upload', upload.single('document'), async (req, res) => {
  // Save document information after Python script execution
  const newDocument = new Document({
      fileName: req.file.originalname, 
      contentType: req.file.mimetype,
      path: req.file.path,
  });
  
  await newDocument.save();
  console.log(req.file);

  // Execute main.py with the uploaded file path
  const pythonScriptPath = 'C:\\Users\\DIGVIJAY\\OneDrive\\Desktop\\doc fraud\\Similar_Document_Template_Matching_Algorithm-master\\MAIN\\Main.py'; // Adjust the path to your Python script
  const uploadedFilePath = req.file.path;

  exec(`python "${pythonScriptPath}" "${uploadedFilePath}"`, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          return res.status(500).send('Error occurred while processing document');
      }
      if (stderr) {
          console.error(`Python script error: ${stderr}`);
          return res.status(500).send('Error occurred while processing document');
      }

      const result = stdout.trim(); // Trim whitespace from the output
      // Pass result to .ejs template
      res.render('result', { result });
  });
});


app.listen(5000, () => console.log('Server running on port 5000'));