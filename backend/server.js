require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

// const passport = require('passport');
// const SamlStrategy = require('passport-saml').Strategy;
// const session = require('express-session');


const doorcodeRoutes = require("./routes/doorcodeRoutes");
const studentRoutes = require("./routes/studentRoutes");
const lockerRoutes = require("./routes/lockerRoutes");

const allowedOrigins = [
  'http://ecetracks.byu.edu',
  'https://ecetracks.byu.edu',
  'http://localhost:5173',
  'http://localhost:3000'
];


const app = express();

// app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.json());
app.use(cors({ origin: allowedOrigins }));

// passport.use(
//   new SamlStrategy(
//     {
//       path: '/login/callback', // Callback URL
//       entryPoint: 'https://cas.byu.edu/cas/idp/profile/SAML2/Redirect/SSO',
//       issuer: 'BYU-ECE-Secretary-Dashboard', // Unique ID for your app
//       cert: null, // Fetch from metadata URL or provide manually
//       identifierFormat: null,
//       decryptionPvk: null, // If encryption is used
//       privateCert: null // If encryption is used
//     },
//     (profile, done) => {
//       // Extract BYU ID from SAML response
//       const byuId = profile['byuid']; // Adjust based on actual SAML attribute
//       return done(null, { byuId });
//     }
//   )
// );

// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

// // SAML Login Route
// app.get('/login', passport.authenticate('saml', { failureRedirect: '/login' }));

// // SAML Callback Route
// app.post(
//   '/login/callback',
//   passport.authenticate('saml', { failureRedirect: '/login' }),
//   async (req, res) => {
//     const byuId = req.user.byuId;
//     // Hit your API to fetch additional user data
//     const userData = await fetchUserDataFromApi(byuId);
//     req.session.user = userData;
//     res.redirect('/dashboard'); // Redirect to frontend
//   }
// );

// async function fetchUserDataFromApi(byuId) {
//   // Example API call (adjust URL and logic)
//   const response = await fetch(`http://your-api.example.com/user/${byuId}`);
//   const data = await response.json();
//   return {
//     byuid: byuId,
//     netid: data.netid,
//     name: data.name,
//     email: data.email,
//     admin: data.admin,
//     gradDate: data.gradDate,
//     // Add other fields as needed
//   };
// }

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/doorcodes", doorcodeRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/lockers", lockerRoutes);

const PORT = process.env.PORT;
const IP = process.env.IP;
app.listen(PORT, IP, () => console.log(`Server running on port ${PORT}`));

