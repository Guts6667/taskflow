# 📚 TaskFlow API Documentation

## 🔍 How to View the Documentation

### Option 1: Swagger Editor (Online) - **Recommended**
1. Go to https://editor.swagger.io/
2. Copy the content of `api.yaml`
3. Paste it in the editor
4. ✨ Interactive documentation with testing capabilities!

### Option 2: VSCode Extension
1. Install "Swagger Viewer" extension
2. Open `api.yaml` in VSCode
3. `Ctrl/Cmd + Shift + P` → "Preview Swagger"

### Option 3: Redoc (Modern UI)
1. Go to https://redocly.github.io/redoc/
2. Click "Try it"
3. Paste your file URL or YAML content

## 🎯 Using the Documentation

### 1. **Testing with Swagger Editor**
- Click "Try it out" on any endpoint
- Fill in the parameters
- Click "Execute" to test directly!

### 2. **Authentication in Swagger**
1. Test `POST /api/auth/login` to get a token
2. Copy the token from the response
3. Click "Authorize" 🔒 at the top
4. Paste the token (Swagger automatically adds "Bearer ")
5. Now all protected endpoints are accessible!

### 3. **Recommended Workflow**
1. `GET /` → Health check
2. `POST /api/auth/register` → Create account
3. `POST /api/auth/login` → Login and get token
4. Use token for `/api/tasks/*` endpoints

## 📝 Updating the Documentation

When adding/modifying routes in the code:
1. Update `api.yaml`
2. Verify everything is correct in Swagger Editor
3. Commit changes

## 🔗 Useful Links

- **Swagger Editor**: https://editor.swagger.io/
- **OpenAPI Specification**: https://swagger.io/specification/
- **YAML Guide**: https://yaml.org/spec/1.2/spec.html

## 🧪 Testing the Current API

### Available Endpoints (Implemented)
- `GET /` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Coming Soon
- `GET /api/tasks` - List user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/stats` - Task statistics

## 🔐 Authentication

All `/api/tasks/*` endpoints require authentication. Include the JWT token in your headers:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires after 7 days.