const { doc, getDoc, updateDoc, increment } = require("firebase/firestore");
const { db } = require("../../firebase-config");

const move = async (user, dir) => {
  const userRef = doc(db, "users", user.id);

  let dirValue = {
    x: 0,
    y: 0,
  };
  switch (dir) {
    case 'north':
      dirValue.y = -1;
      break;
    case 'northeast':
      dirValue.x = 1;
      dirValue.y = -1;
      break;
    case 'east':
      dirValue.x = 1;
      break;
    case 'southeast':
      dirValue.x = 1;
      dirValue.y = 1;
      break;
    case 'south':
      dirValue.y = 1;
      break;
    case 'southwest':
      dirValue.x = -1;
      dirValue.y = -1;
      break;
    case 'west':
      dirValue.x = -1;
      break;
    case 'northwest':
      dirValue.x = -1;
      dirValue.x = -1;
      break;
  }

  // needs checks for a lot of stuff lol
  updateDoc(userRef, {
    'coords.x': increment(dirValue.x),
    'coords.y': increment(dirValue.y)
  });

  return true;
};

module.exports = { move };