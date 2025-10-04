# Kubernetes Todo Application

A full-stack Todo application demonstrating containerization with Docker, orchestration with Kubernetes, and deployment on Fly.io.

## Tech Stack

- **Frontend**: React, Axios
- **Backend**: Node.js, Express
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Deployment**: Fly.io

## Project Structure

```
k8s-todo-app/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── fly.toml
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── fly.toml
├── k8s/
│   ├── backend-deployment.yaml
│   └── frontend-deployment.yaml
└── docker-compose.yml
```

## Local Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- kubectl (for Kubernetes)

### Run with Docker Compose

```bash
docker-compose up --build
```

Access the app at `http://localhost`

### Run Backend Only

```bash
cd backend
npm install
npm run dev
```

### Run Frontend Only

```bash
cd frontend
npm install
npm start
```

## Docker Build & Push

### Build Images

```bash
# Backend
cd backend
docker build -t your-dockerhub-username/todo-backend:latest .

# Frontend
cd ../frontend
docker build -t your-dockerhub-username/todo-frontend:latest .
```

### Push to Docker Hub

```bash
docker push your-dockerhub-username/todo-backend:latest
docker push your-dockerhub-username/todo-frontend:latest
```

## Kubernetes Deployment

### Update Image Names

Edit `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml` to use your Docker Hub username.

### Deploy to Kubernetes

```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### Check Status

```bash
kubectl get pods
kubectl get services
```

## Fly.io Deployment

### Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### Login to Fly.io

```bash
fly auth login
```

### Deploy Backend

```bash
cd backend
fly launch --no-deploy
fly deploy
```

### Deploy Frontend

```bash
cd ../frontend
fly launch --no-deploy
fly deploy
```

### Check Status

```bash
fly status -a todo-backend-k8s
fly status -a todo-frontend-k8s
```

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `GET /health` - Health check

## Features

- ✅ Create, read, update, and delete todos
- ✅ Mark todos as completed
- ✅ Persistent data (in-memory)
- ✅ Responsive design
- ✅ Docker containerization
- ✅ Kubernetes orchestration
- ✅ Health checks
- ✅ Resource limits
- ✅ Production-ready deployment

## License

MIT