import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a random inbox name using Indian names
export function generateRandomInbox() {
  const firstNames = [
    "aarav",
    "vivaan",
    "aditya",
    "vihaan",
    "arjun",
    "sai",
    "reyansh",
    "ayaan",
    "krishna",
    "ishaan",
    "shaurya",
    "atharv",
    "advait",
    "arnav",
    "dhruv",
    "kabir",
    "ritvik",
    "aarush",
    "kian",
    "darsh",
    "ananya",
    "diya",
    "aadhya",
    "pihu",
    "priya",
    "shreya",
    "isha",
    "kavya",
    "anika",
    "saanvi",
    "meera",
    "tara",
    "riya",
    "neha",
    "pooja",
    "anjali",
    "divya",
    "nisha",
    "sanya",
    "aditi",
    "rohan",
    "rahul",
    "amit",
    "vikram",
    "suresh",
    "rajesh",
    "manish",
    "nikhil",
  ];

  const middleNames = [
    "kumar",
    "devi",
    "prasad",
    "lal",
    "chand",
    "nath",
    "ram",
    "prakash",
    "mohan",
    "kishan",
    "gopal",
    "shyam",
    "babu",
    "singh",
    "rani",
    "kumari",
    "bala",
    "chandra",
    "lakshmi",
    "ganga",
    "maya",
    "rekha",
    "sunder",
    "ratan",
  ];

  const lastNames = [
    "sharma",
    "verma",
    "gupta",
    "singh",
    "kumar",
    "patel",
    "reddy",
    "rao",
    "joshi",
    "mehta",
    "shah",
    "trivedi",
    "pandey",
    "mishra",
    "tiwari",
    "dubey",
    "chauhan",
    "yadav",
    "agarwal",
    "bansal",
    "kapoor",
    "malhotra",
    "chopra",
    "bhatia",
    "saxena",
    "srivastava",
    "rastogi",
    "kulkarni",
    "deshmukh",
    "patil",
    "nair",
    "menon",
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  // Middle name is optional (50% chance)
  const includeMiddleName = Math.random() > 0.5;

  if (includeMiddleName) {
    const middleName =
      middleNames[Math.floor(Math.random() * middleNames.length)];
    return `${firstName}.${middleName}.${lastName}`;
  }

  return `${firstName}.${lastName}`;
}
