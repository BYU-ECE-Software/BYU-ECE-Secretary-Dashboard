import "dotenv/config";
import express from "express";
import cors from "cors";
//import fs from 'fs';

// const passport = require('passport');
// const SamlStrategy = require('passport-saml').Strategy;
// const session = require('express-session');

import positionRoutes from "./routes/positionRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import lockerRoutes from "./routes/lockerRoutes.js";
import keyRoutes from "./routes/keyRoutes.js";
import deskRoutes from "./routes/deskRoutes.js";
import dateRoutes from "./routes/importantDatesRoutes.js";

const allowedOrigins = [
  "http://localhost",
  "http://localhost:5173",
  "http://localhost:3000",
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

// Mount Route Points
app.use("/api/position", positionRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/locker", lockerRoutes);
app.use("/api/key", keyRoutes);
app.use("/api/desk", deskRoutes);
app.use("/api/date", dateRoutes);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
