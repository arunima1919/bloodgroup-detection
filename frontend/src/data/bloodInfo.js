const bloodInfo = {
  "A+": {
    donateTo: ["A+", "AB+"],
    receiveFrom: ["A+", "A-", "O+", "O-"],
    type: "Common",
    about:
      "A+ is one of the most common blood groups. People with A+ blood have A antigens on red blood cells and Rh factor present."
  },

  "A-": {
    donateTo: ["A+", "A-", "AB+", "AB-"],
    receiveFrom: ["A-", "O-"],
    type: "Rare",
    about:
      "A- blood group lacks the Rh factor. It is less common and can donate to both Rh positive and negative A and AB groups."
  },

  "B+": {
    donateTo: ["B+", "AB+"],
    receiveFrom: ["B+", "B-", "O+", "O-"],
    type: "Common",
    about:
      "B+ blood group has B antigens and Rh factor present. It can donate to B+ and AB+."
  },

  "B-": {
    donateTo: ["B+", "B-", "AB+", "AB-"],
    receiveFrom: ["B-", "O-"],
    type: "Rare",
    about:
      "B- blood is relatively rare and can donate to both Rh positive and negative B and AB groups."
  },

  "AB+": {
    donateTo: ["AB+"],
    receiveFrom: ["All"],
    type: "Universal Receiver",
    about:
      "AB+ is known as the universal receiver because people with AB+ can receive blood from all blood groups."
  },

  "AB-": {
    donateTo: ["AB+", "AB-"],
    receiveFrom: ["A-", "B-", "AB-", "O-"],
    type: "Rare",
    about:
      "AB- is one of the rarest blood types and can receive from other Rh negative groups."
  },

  "O+": {
    donateTo: ["A+", "B+", "AB+", "O+"],
    receiveFrom: ["O+", "O-"],
    type: "Very Common",
    about:
      "O+ is the most common blood group worldwide and can donate to all positive blood groups."
  },

  "O-": {
    donateTo: ["All"],
    receiveFrom: ["O-"],
    type: "Universal Donor",
    about:
      "O- is the universal donor and can donate blood to any blood group."
  }
};

export default bloodInfo;