<?php
/**
 * Media Delete Handler for Digital Signage
 * Save this file as 'delete_media.php' on your cPanel server.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['media_url'])) {
        $mediaUrl = $data['media_url'];
        
        // Extract filename from URL
        // Example URL: https://hz.jkcshiru.com/media/timestamp_filename.jpg
        $urlParts = parse_url($mediaUrl);
        $path = $urlParts['path'];
        $fileName = basename($path);
        
        $uploadDirectory = 'media/';
        $filePath = $uploadDirectory . $fileName;

        if (file_exists($filePath)) {
            if (unlink($filePath)) {
                echo json_encode([
                    "status" => "success",
                    "message" => "File deleted successfully from server."
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Could not delete file from server."]);
            }
        } else {
            // File might already be gone or path is wrong
            echo json_encode(["status" => "error", "message" => "File not found on server at $filePath"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No media_url provided."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
