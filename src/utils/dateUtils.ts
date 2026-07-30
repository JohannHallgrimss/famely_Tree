const icelandicMonths: Record<string, number> = {
  janúar: 0,
  febrúar: 1,
  mars: 2,
  apríl: 3,
  maí: 4,
  júní: 5,
  júlí: 6,
  ágúst: 7,
  september: 8,
  október: 9,
  nóvember: 10,
  desember: 11
};


const englishMonths: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11
};



export const parseDate = (
  value: string | null | undefined
): Date | null => {

  if (!value) {
    return null;
  }


  const clean = value
    .trim()
    .toLowerCase()
    .replace(',', '');



  // dd.MM.yyyy
  const numericMatch =
    clean.match(
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
    );


  if (numericMatch) {

    const day =
      Number(numericMatch[1]);

    const month =
      Number(numericMatch[2]);

    const year =
      Number(numericMatch[3]);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }

  }



  // yyyy-MM-dd
  const isoMatch =
    clean.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );


  if (isoMatch) {

    const year =
      Number(isoMatch[1]);

    const month =
      Number(isoMatch[2]);

    const day =
      Number(isoMatch[3]);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }

  }



  // íslenskt format:
  // 24. ágúst 2004
  const icelandicMatch =
    clean.match(
      /^(\d{1,2})\.\s*([a-záðéíóúýþæö]+)\s*(\d{4})$/
    );


  if (icelandicMatch) {

    const day =
      Number(icelandicMatch[1]);

    const monthName =
      icelandicMatch[2];

    const year =
      Number(icelandicMatch[3]);


    const month =
      icelandicMonths[monthName];


    if (month !== undefined) {

      return new Date(
        year,
        month,
        day
      );

    }

  }



  // enskt format:
  // September 14 1975
  const englishMatch =
    clean.match(
      /^([a-z]+)\s+(\d{1,2})\s+(\d{4})$/
    );


  if (englishMatch) {

    const monthName =
      englishMatch[1];

    const day =
      Number(englishMatch[2]);

    const year =
      Number(englishMatch[3]);


    const month =
      englishMonths[monthName];


    if (month !== undefined) {

      return new Date(
        year,
        month,
        day
      );

    }

  }



  return null;
};




export const formatDate = (
  value: string | null | undefined
): string => {

  const date =
    parseDate(value);


  if (!date) {
    return '—';
  }


  return date.toLocaleDateString(
    'is-IS',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
  );
};




export const getAge = (
  born: string | null | undefined
): number | null => {

  const birthDate =
    parseDate(born);


  if (!birthDate) {
    return null;
  }


  const today =
    new Date();


  let age =
    today.getFullYear()
    -
    birthDate.getFullYear();



  const birthdayThisYear =
    new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );


  if (birthdayThisYear > today) {
    age--;
  }


  return age;
};




export const getDaysUntilBirthday = (
  born: string | null | undefined
): number | null => {

  const birthDate =
    parseDate(born);


  if (!birthDate) {
    return null;
  }


  const today =
    new Date();


  today.setHours(
    0,
    0,
    0,
    0
  );



  let nextBirthday =
    new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );


  nextBirthday.setHours(
    0,
    0,
    0,
    0
  );



  if (nextBirthday < today) {

    nextBirthday =
      new Date(
        today.getFullYear() + 1,
        birthDate.getMonth(),
        birthDate.getDate()
      );

  }



  return Math.ceil(
    (
      nextBirthday.getTime()
      -
      today.getTime()
    )
    /
    (1000 * 60 * 60 * 24)
  );
};