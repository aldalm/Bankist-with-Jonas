'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-05-30T21:31:17.178Z',
    '2023-06-02T07:42:02.383Z',
    '2023-06-01T09:15:04.904Z',
    '2023-05-27T10:17:24.185Z',
    '2023-06-02T17:11:59.604Z',
    '2023-06-01T17:01:17.194Z',
    '2023-05-25T23:36:17.929Z',
    '2023-06-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Almaz Ibraev',
  movements: [50000, 3400, -150, -790, -3210, -1000, 85000, 30000],
  interestRate: 1.5,
  pin: 2356,

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

/////////////////////////////////////////////////
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

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date) {
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));//converting ms to day

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const now = new Date();
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);//zero based bcause
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);
    //Internatiolizing numbers:
    const formattedMov = formatCur(mov, acc.locale, acc.currency)

    // new Intl.NumberFormat(acc.locale, {
    //   style: 'currency',
    //   currency: acc.currency,
    // }).format(mov);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1
      } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency)
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency)



  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};



//Call the timer every second
const startLogOutTimer = function () {

  const tick = function () {

    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //in each call, print the remainig time to UI
    labelTimer.textContent = `${min}:${sec}`;


    //when 0 second, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Please log in to get started';
      containerApp.style.opacity = 0;
    }
    //decrease 1 second
    time--;// time = time -1
  }
  //set time to 5 min
  let time = 120;


  const timer = setInterval(tick, 1000);
  return timer;

};

// startLogOutTimer();
///////////////////////////////////////
// Event handlers
let currentAccount, timer;

//FAKE ALWAYS LOGGED
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//Experimenting Int API




//Implemeniting Dates



btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === +(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]
      }`;
    containerApp.style.opacity = 100;

    //current Date

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long'
    }
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);// 6/2/2023

    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);//zero based bcause
    // const year = now.getFullYear();
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    //Log out timer

    //timer
    if (timer) clearInterval(timer);
    // 

    timer = startLogOutTimer();
    //Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString);

    // Update UI
    updateUI(currentAccount);

    //Reset the timer after activity in transfer nutton:
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    //Add setTimeout
    setTimeout(function () {
      currentAccount.movements.push(amount);
      // Doing the loan
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount)
      //Reset the timer after activity in transfer nutton:
      clearInterval(timer);
      timer = startLogOutTimer();

    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(acc.movements, !sorted);
  // displayMovements(acc, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
//170 Converting and checking numbers
// console.log(23 === 23.0);//true

// //binary
// console.log(0.1 + 0.2);//0.30000000000000004 - )
// console.log(0.1 + 0.2 === 0.3);//false. we have to exept this, because in JS we can't do anything with it)

// //Conversion
// console.log(Number('23'));//23
// console.log(+'23');//23

// const x = +'23';//+ sighn automaticaly converts string to number!
// console.log(typeof x);//number

//Parsing
// console.log(Number.parseInt('23px', 10));//23 - string needs to start with numbers. Second argument - 10 is REDUX number - десятеричная система как  понял
// //but
// console.log(Number.parseInt('px23', 10));//NaN

// console.log(Number.parseFloat('2.5 rem'));//2.5
// console.log(Number.parseInt('2.5 rem'));//2  - it's not working correctly indeed with parseInt


// console.log(Number.isNaN(20));//false
// console.log(Number.isNaN('20'));//false
// console.log(Number.isNaN(+'20x'));//true
// console.log(Number.isNaN(28 / 0));//false - It is Infinite indeed

//checking if value is NaN
// console.log(Number.isFinite(23));//true
// console.log(Number.isFinite('23'));//false
// console.log(Number.isFinite(+'23'));//true
// console.log(Number.isFinite('23x'));//false

// //best way checking if the value is number
// console.log(Number.isFinite(23 / 0));//false

// //or
// console.log(Number.isInteger(20));//true
// console.log(Number.isInteger('20'));//false
// console.log(Number.isInteger(20 / 0));//false

// //172 MATH AND ROUNDING
// //SQURE
// console.log(Math.sqrt(25));//5
// //or
// console.log(25 ** (1 / 2));//5

// //cube square
// console.log(8 ** (1 / 3));//2

// console.log(Math.max(12, 100, 56, 6));//100
// console.log(Math.max(12, '100', 56, 6));//100
// console.log(Math.max(12, '100px', 56, 6));//NaN

// //MAX MIN

// console.log(Math.min(23, 50, 200, 2, 3));//2
// console.log(Math.min(23, 50, 200, '2', 3));//2
// console.log(Math.min(23, 50, 200, '2px', 3));//NaN

// //let's calculate the area of circle with 10px radius:
// console.log(Math.PI * Number.parseFloat('10px') ** 2);//314.159265

// //Random number

// console.log(Math.trunc(Math.random() * 10) + 1);//Random number from 0 to 10. +1 because of truncating the decimal parts

// //random numbers in certain range of number. for example from 10 to 20


// const randomNumb = (min, max) => Math.floor(Math.random() * (max - min) + 1) + min;
// console.log(randomNumb(10, 20));//floor instead of trunc because of negative numbers

// //Rounding integers
// console.log(Math.trunc(23.45));//23
// console.log(Math.round(23.34));//23
// console.log(Math.round(23.98)); //24
// console.log(Math.round(23.12));//23
// console.log(Math.round(23.5));//24
// console.log(Math.round(23.6));//24

// //Rounded up
// console.log(Math.ceil(23.9));//24
// console.log(Math.ceil(23.1));//24

// //Rounded down
// console.log(Math.floor(23.9));//23
// console.log(Math.floor(23.1));//23

// console.log(Math.trunc(-23.3));//-23
// console.log(Math.floor(-23.3));//-24


// //Decimal rounding
// console.log((23.6578).toFixed(2));//23.66 - string
// console.log(+(23.6578).toFixed(2));//23.66 - number


// //172. THE REMINDER OPERATOR - ОСТАТОК

// console.log(5 % 2);//1 => 2*3 + 1
// console.log(8 % 3);//2 => 8 = 3 * 3 + 2

// //четное число или нет:

// const isEven = n => n % 2 === 0;

// console.log(isEven(65));//false
// console.log(isEven(8));//true
// console.log(isEven(9));//false
// console.log(isEven(898));//true

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements_row')].forEach(function (row, i) {

//     if (i % 2 === 0) row.style.backgroundColor = 'orange';

//     if (i % 3 === 0) row.style.backgroundColor === 'blue';
//   });
// });

// //173 NUMERIC SEPARATORS

// //248,789,000,000
// const diameter = 248_789_000_000;
// console.log(diameter);//2487890000
// console.log(typeof (diameter));//number

// //could use undersore _ to separate numbers. JS doesn't see underscore between nubmers

// //174. BIGiNT - PRIMITIVE DATA TYPE
// //bigInt - in ES2020 
// //64 bits - but only 53 bits representing to digits, others to decimals point and asighn
// console.log(2 ** 53 - 1);//9007199254740991 - this is biggest number that JS can represents
// console.log(Number.MAX_SAFE_INTEGER);//9007199254740991

// //CREATING DATES
// //there are 4 ways of creating dates un JS
// const now = new Date();
// console.log(now);//Thu Jun 01 2023 11:12:24 GMT+0600 (Bangladesh Standard Time)

// console.log(new Date(0));//Thu Jan 01 1970 06:00:00 GMT+0600 (Bangladesh Standard Time)

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);//Thu Nov 19 2037 15:23:00 GMT+0600 (Bangladesh Standard Time)
// //день_недели, месяц, число, год, час, минута, секунда
// console.log(future.getFullYear());//2037
// console.log(future.getMonth());//10 - actually this is 0_based, indeed 10 - is November
// console.log(future.getDate());//19 - day
// console.log(future.getDay());//4 - day of week
// console.log(future.getHours());//15
// console.log(future.getMinutes());//23
// console.log(future.getMilliseconds());//0
// console.log(future.toISOString());//2037-11-19T09:23:00.000Z
// console.log(future.getTime());//2142235380000 - in ms

// console.log(new Date(2142235380000));//Thu Nov 19 2037 15:23:00 GMT+0600 (Bangladesh Standard Time)

// console.log(Date.now());//1685598006361
// console.log(new Date(1685598006361));//Thu Jun 01 2023 11:40:06 GMT+0600 (Bangladesh Standard Time)

// future.setFullYear(2040);
// console.log(future);//Mon Nov 19 2040 15:23:00 GMT+0600 (Bangladesh Standard Time)

//  177 OPERATIONS WITH DATES

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);//Thu Nov 19 2037 15:23:00 GMT+0600 (Bangladesh Standard Time)
// console.log(Number(future));//2142235380000
// console.log(+future);//2142235380000

//let's define the difference between two dates

// const calcDaysPassed = (date1, date2) => Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);//converting ms to day

// const dayDiff = diffDates(new Date(2037, 10, 19), new Date(2037, 10, 29));
// console.log(dayDiff);
// console.log(calcDaysPassed(new Date(1976, 10, 1), new Date(1997, 2, 18)));//7442 days
// console.log(7442 / 360);//20.672 years





// console.log(+new Date(2023, 5, 2) / (1000 * 60 * 60 * 24));



// console.log(+new Date(2037, 10, 29));//2143044000000 ms
// console.log(+new Date(2037, 10, 24));//2142612000000 ms

// console.log(+new Date(2037, 10, 29) / (1000 * 60 * 60 * 24));//2143044000000 ms

// const a = +new Date(2037, 10, 29);
// console.log(a);
// const b = +new Date(2037, 10, 19);
// console.log(b);

// console.log((a - b) / (1000 * 60 * 60 * 24));

//171 Interantionaling Numbers

// const num = 3884561236.44;
// const options = {
//   style: 'currency',
//   unit: 'celsius',
//   currency: 'EUR'
// };

// console.log('US: ', new Intl.NumberFormat('en-US').format(num));//3,884,561,236.44
// console.log('Germany: ', new Intl.NumberFormat('de-DE').format(num));//3.884.561.236,44
// console.log('Suria: ', new Intl.NumberFormat('ar-SY').format(num));//٣٬٨٨٤٬٥٦١٬٢٣٦٫٤٤

// console.log(navigator.language);//en-US
// console.log(navigator.language, new Intl.NumberFormat(navigator.language, options).format(num));//en-US €3,884,561,236.44


//172 setTimeOut and setInterval

// setTimeout(() => console.log('Here is your pizza - after 3 sec'), 3000);
// //the same code with usual method not in arrow function
// setTimeout(function () {
//   console.log('Here is your order - after 4 sec');
// }, 4000);
// console.log('Waiting ...');

// const ingrediets = ['olives', 'spinach'];

// const pizzaTimer = setTimeout((ing1, ing2,) => console.log(`Here is your pizza with ${ing1} and ${ing2}!`), 3000, 'mashrooms', 'sousage');
// if (ingrediets.includes('spinach')) clearTimeout(pizzaTimer);//dosen't appear anything

//setInterval()

// setInterval(function () {
//   const now = new Date();
//   const hours = now.getHours();
//   const min = now.getMinutes();
//   const sec = now.getSeconds();

//   console.log(`${hours}:${min}:${sec}`);
// }, 2000);






























































































































































