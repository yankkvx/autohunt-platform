from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from .serializers import UserSerializer

# Documentation for listing and creating users
user_management_get = extend_schema(
    summary="List all users",
    description="""
    Handles GET requests to retrieve all registered users.

    Examples:
    1. List all users:
       GET /users/

    Returns:
    - A JSON array of user objects.
    - Each user object contains fields defined in the UserSerializer.

    Possible Status Codes:
    - 200: Success.
    - 500: An unexpected server error occurred.
    """,
    responses={
        200: UserSerializer(many=True),
        500: OpenApiTypes.OBJECT,
    },
    tags=["Users"],
)

user_management_post = extend_schema(
    summary="Create a new user",
    description="""
    Handles POST requests to create a new user.

    Body Parameters:
    - All fields required by the UserSerializer (e.g., username, email, password, etc.).

    Examples:
    1. Create a new user:
       POST /users/
       {
           "username": "new_user",
           "email": "new_user@example.com",
           "password": "strong_password"
       }

    Returns:
    - The created user object.
    - An error message with the appropriate HTTP status code if validation fails.

    Possible Status Codes:
    - 201: User successfully created.
    - 400: Validation error.
    - 500: An unexpected server error occurred.
    """,
    request=UserSerializer,
    responses={
        201: UserSerializer,
        400: OpenApiTypes.OBJECT,
        500: OpenApiTypes.OBJECT,
    },
    tags=["Users"],
)

# Documentation for retrieving and deleting a user
user_details_get = extend_schema(
    summary="Retrieve a specific user",
    description="""
    Handles GET requests to retrieve a user by their ID.

    Path Parameters:
    - pk (int): The unique ID of the user.

    Examples:
    1. Retrieve user with ID 5:
       GET /users/5/

    Returns:
    - The user object if found.
    - An error message with the appropriate HTTP status code if not found.

    Possible Status Codes:
    - 200: Success.
    - 404: User not found.
    - 500: An unexpected server error occurred.
    """,
    responses={
        200: UserSerializer,
        404: OpenApiTypes.OBJECT,
        500: OpenApiTypes.OBJECT,
    },
    tags=["Users"],
)

user_details_put = extend_schema(
    summary="Update a specific user",
    description="""
    Handles PUT requests to update a user by their ID.

    Path Parameters:
    - pk (int): The unique ID of the user.

    Body Parameters:
    - All fields required by the UserSerializer (full user data for replacement).
    - Passwords will be hashed automatically if provided.

    Examples:
    1. Update user with ID 5:
       PUT /users/5/
       {
           "username": "updated_user",
           "email": "updated_email@example.com",
           "password": "new_secure_password",
           "first_name": "Updated",
           "last_name": "User"
       }

    Returns:
    - The updated user object.
    - An error message with the appropriate HTTP status code if validation fails or user not found.

    Possible Status Codes:
    - 200: User successfully updated.
    - 400: Validation error.
    - 404: User not found.
    - 500: An unexpected server error occurred.
    """,
    request=UserSerializer,
    responses={
        200: UserSerializer,
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
        500: OpenApiTypes.OBJECT,
    },
    tags=["Users"],
)


user_details_delete = extend_schema(
    summary="Delete a specific user",
    description="""
    Handles DELETE requests to remove a user by their ID.

    Path Parameters:
    - pk (int): The unique ID of the user.

    Examples:
    1. Delete user with ID 3:
       DELETE /users/3/

    Returns:
    - No content if deletion is successful.
    - An error message with the appropriate HTTP status code if not found.

    Possible Status Codes:
    - 204: User successfully deleted.
    - 404: User not found.
    - 500: An unexpected server error occurred.
    """,
    responses={
        204: None,
        404: OpenApiTypes.OBJECT,
        500: OpenApiTypes.OBJECT,
    },
    tags=["Users"],
)
