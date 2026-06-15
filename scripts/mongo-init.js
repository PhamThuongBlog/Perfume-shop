// MongoDB init script - initializes replica set
// This runs INSIDE the MongoDB container

rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "mongodb:27017" }]
});

// Wait for replica set to be ready
sleep(3000);

// Verify
const status = rs.status();
print("Replica set ready: " + status.set);
