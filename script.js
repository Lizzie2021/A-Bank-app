'use strict';

/////////////////////////////////////////////////
// BANKIST APP
//username / pin : ll/1111, ad/2222
// Data
const account1 = {
  owner: 'Lizzie Li',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-05-23T17:01:17.194Z',
    '2022-05-24T23:36:17.929Z',
    '2022-05-26T10:51:36.790Z',
  ],
  currency: 'CNY',
  locale: 'zh-CN', // de-DE
};

const account2 = {
  owner: 'Aaron Deng',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentAccount,
  balance,
  sort = false;

//Functions
//Create username
const createUsername = acc => {
  acc.username = acc.owner
    .split(' ')
    .map(word => word[0])
    .join('')
    .toLowerCase();
};
accounts.forEach(acc => createUsername(acc));

//Intl NumberFormat
const numberFormatIntl = (acc, locale, number) => {
  const optionsNum = {
    style: 'currency',
    currency: acc.currency,
  };
  const numberFormated = new Intl.NumberFormat(locale, optionsNum).format(
    number
  );
  return numberFormated;
};

//CalcDisplay balance
const calcDisplayBalance = acc => {
  const optionsDate = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: '2-digit',
    year: 'numeric',
    weekday: 'long',
  };

  const date = new Intl.DateTimeFormat(acc.locale, optionsDate).format(
    new Date()
  );

  balance = acc.movements.reduce((sum, mov) => sum + mov, 0);

  labelBalance.textContent = `${numberFormatIntl(acc, acc.locale, balance)}`;
  labelDate.textContent = date;
};

//Check Days
const checkDays = (date, acc) => {
  const now = Date.now();
  const then = new Date(date);
  const daysPassed = Math.round((now - then.getTime()) / 1000 / 60 / 60 / 24);
  const optionsDate = {
    day: 'numeric',
    month: '2-digit',
    year: 'numeric',
  };
  if (daysPassed === 0) {
    return 'Today';
  }
  if (daysPassed === 1) {
    return 'Yesterday';
  }
  if (daysPassed < 7) {
    return `${daysPassed} days ago`;
  } else {
    return `${new Intl.DateTimeFormat(acc.locale, optionsDate).format(then)}`;
  }
};
//Display movements
const displayMovements = (acc, movements) => {
  containerMovements.innerHTML = '';

  movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const movementsDate = new Date(acc.movementsDates[i]);

    const html = `<div class="movements__row">
                 <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${checkDays(movementsDate, acc)}</div>
                 <div class="movements__value">${numberFormatIntl(
                   acc,
                   acc.locale,
                   mov
                 )}</div>
                </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//CalDisplay summary
const calDisplaySummary = acc => {
  const sums = acc.movements.reduce(
    (sum, mov) => {
      mov > 0 ? (sum.deposits += mov) : (sum.withdrawals += mov);
      return sum;
    },
    { deposits: 0, withdrawals: 0 }
  );
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .reduce((sum, mov) => sum + mov, 0);

  labelSumIn.textContent = `${numberFormatIntl(
    acc,
    acc.locale,
    sums.deposits
  )}`;
  labelSumOut.textContent = `${numberFormatIntl(
    acc,
    acc.locale,
    sums.withdrawals
  )}`;
  labelSumInterest.textContent = `${numberFormatIntl(
    acc,
    acc.locale,
    interest
  )}`;
};

//Update UI
const updateUI = acc => {
  calcDisplayBalance(acc);
  displayMovements(acc, acc.movements);
  calDisplaySummary(acc);
};

//Sort
const sortMovement = acc => {
  if (!sort) {
    const sortedMov = acc.movements.slice().sort((a, b) => a - b);
    displayMovements(acc, sortedMov);
    sort = true;
  } else {
    displayMovements(acc, acc.movements);
    sort = false;
  }
};

//Timer
let setTimer;
const timer = (totalSeconds = 300) => {
  setTimer = setInterval(() => {
    const minute = Math.trunc(totalSeconds / 60)
      .toString()
      .padStart(2, 0);
    const second = (totalSeconds % 60).toString().padStart(2, 0);
    if (totalSeconds >= 0) {
      labelTimer.textContent = `${minute} : ${second}`;
      totalSeconds--;
    } else {
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
      clearInterval(setTimer);
    }
  }, 1000);
};
//////////////////////////////////////
//Event handlers

//Login
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  inputLoginPin.blur();
  accounts.forEach(acc => {
    if (
      inputLoginUsername.value === acc.username &&
      +inputLoginPin.value === acc.pin
    ) {
      currentAccount = acc;
      labelWelcome.textContent = `Welcome back, ${acc.owner.split(' ')[0]}`;
      containerApp.style.opacity = 100;
      labelTimer.textContent = '';
    }
  });
  inputLoginUsername.value = '';
  inputLoginPin.value = '';
  updateUI(currentAccount);
  clearInterval(setTimer);
  timer();
});

//Transfer money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const tranferTo = inputTransferTo.value;
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(acc => acc.username === tranferTo);
  if (
    amount > 0 &&
    tranferTo &&
    amount <= balance &&
    tranferTo !== currentAccount.username
  ) {
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
  }
  updateUI(currentAccount);
  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  inputTransferAmount.blur();
  clearInterval(setTimer);
  timer();
});

//Request loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loan = +inputLoanAmount.value;
  setTimeout(() => {
    if (
      loan > 0 &&
      currentAccount.movements
        .filter(mov => mov > 0)
        .some(deposit => deposit > loan * 0.1)
    ) {
      currentAccount.movements.push(loan);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }
  }, 3000);

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
  clearInterval(setTimer);
  timer();
});

//Close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const comfirmUser = inputCloseUsername.value;
  const confirmPin = +inputClosePin.value;

  if (
    comfirmUser === currentAccount.username &&
    confirmPin === currentAccount.pin
  ) {
    accounts.splice(accounts.indexOf(currentAccount), 1);
    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = 0;
    clearInterval(setTimer);
  }
});

//Sort
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sortMovement(currentAccount);
  clearInterval(setTimer);
  timer();
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
