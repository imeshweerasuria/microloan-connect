module.exports = {
  generateBorrowerData
};

function generateBorrowerData(userContext, events, done) {
  const stamp = Date.now();
  const rand = Math.floor(Math.random() * 100000);

  userContext.vars.name = `Perf Borrower ${rand}`;
  userContext.vars.email = `perf_borrower_${stamp}_${rand}@test.com`;
  userContext.vars.password = "password123";
  userContext.vars.loanTitle = `Perf Loan ${rand}`;

  return done();
}