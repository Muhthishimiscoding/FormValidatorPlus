<?php 
print_r($_POST);
print_r($_FILES);

print_r(json_decode(file_get_contents('php://input'),true));

// file_put_contents()