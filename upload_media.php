<?php
/**
 * Media Upload Handler for Digital Signage
 * Save this file as 'upload_media.php' on your cPanel server.
 * Ensure the directory 'media/' exists and is writable (chmod 755 or 777).
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$uploadDirectory = 'media/';
if (!is_dir($uploadDirectory)) {
    mkdir($uploadDirectory, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file'])) {
        $file = $_FILES['file'];
        $fileName = time() . '_' . basename($file['name']);
        $targetFilePath = $uploadDirectory . $fileName;
        $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

        // Allow certain file formats
        $allowTypes = array('jpg', 'png', 'jpeg', 'gif', 'mp4', 'webm', 'mov');
        
        if (in_array($fileType, $allowTypes)) {
            if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
                // Get the base URL
                $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
                $baseUrl = $protocol . "://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']);
                $fileUrl = rtrim($baseUrl, '/') . '/' . $targetFilePath;

                echo json_encode([
                    "status" => "success",
                    "url" => $fileUrl,
                    "message" => "File uploaded successfully."
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Sorry, there was an error uploading your file."]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Sorry, only JPG, JPEG, PNG, GIF, MP4, WEBM, MOV files are allowed."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No file was uploaded."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
