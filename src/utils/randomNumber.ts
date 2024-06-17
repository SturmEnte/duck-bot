export default function getRandomNumber(x, y) {
   return Math.floor(Math.random() * (y - x + 1)) + x;
}
