const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const primeAccountId = process.env.PRIME_ACCOUNT_ID; 

const checkPrimeAccount = (req, res, next) => {
  const userId = req.headers.userid; // Fetch userId from headers

  if (userId && userId.toString() === primeAccountId) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Only the prime account can create new accounts.' });
  }
};

module.exports = checkPrimeAccount;
