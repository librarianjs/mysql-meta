CREATE DATABASE librarian_test;

CREATE TABLE librarian_test.files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fileName VARCHAR(128),
  mimeType VARCHAR(64),
  fileSize INT
);
