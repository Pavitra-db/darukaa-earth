Darukaa.Earth



Darukaa.Earth is a full-stack geospatial environmental project management and monitoring platform. It provides user authentication, project management, monitoring-site management, interactive map visualization, environmental monitoring, biodiversity lookup, and analytics.



Live Application



Frontend: https://darukaa-earth-1-mrr2.onrender.com



Backend API: https://darukaa-earth-yc3m.onrender.com



API documentation: https://darukaa-earth-yc3m.onrender.com/docs



GitHub repository: https://github.com/Pavitra-db/darukaa-earth



Architecture



The application follows a client-server architecture:



React + Vite frontend

&#x20;       |

&#x20;       | HTTPS / REST API + JWT

&#x20;       v

FastAPI backend

&#x20;       |

&#x20;       | SQLAlchemy / GeoAlchemy2

&#x20;       v

PostgreSQL + PostGIS



External services used by the application include NASA POWER for weather/environmental data and GBIF-based biodiversity lookup.



Frontend



React



Vite



JavaScript



Google Maps JavaScript API for interactive maps and polygon/site visualization



Recharts for interactive charts



Fetch-based REST API integration



Backend



Python



FastAPI



SQLAlchemy



GeoAlchemy2



Shapely



JWT authentication



PostgreSQL/PostGIS



Security



JWT-based authentication



Protected project/site endpoints



User-scoped project data



User-scoped monitoring sites through project ownership



Secrets and database credentials are kept in environment variables and are not committed to the repository



Main Features



Authentication



Users can register and log in. A JWT access token is stored in the browser for authenticated API requests.



Project Management



Authenticated users can create, view, and delete environmental projects. Project ownership is associated with the authenticated user.



Monitoring Sites



A project can contain monitoring sites with geographic coordinates, area information, descriptions, and polygon boundaries.



Interactive Map



The map displays monitoring locations and saved polygon boundaries. Users can search for locations and create monitoring sites from geographic coordinates/polygon data.



Environmental Monitoring



Monitoring data can be retrieved for a selected site, including weather data fetched from NASA POWER.



Biodiversity



The application provides biodiversity information for monitoring locations using GBIF-related data services.



Analytics



Environmental readings can be presented through interactive charts for easier interpretation of site performance over time.



Database Schema



users



id - primary key



name



email - unique



hashed\_password



created\_at



projects



id - primary key



user\_id - foreign key to users.id



name



description



location



status



created\_at



Relationship:



users 1 ---- N projects



sites



id - primary key



project\_id - foreign key to projects.id



name



latitude



longitude



area\_hectares



description



boundary - PostGIS polygon geometry



created\_at



Relationship:



projects 1 ---- N sites



environmental\_readings



id - primary key



site\_id - foreign key to sites.id



temperature



rainfall



air\_quality



soil\_moisture



recorded\_at



Relationship:



sites 1 ---- N environmental\_readings



Local Setup



1\. Clone the repository



git clone https://github.com/Pavitra-db/darukaa-earth.git

cd darukaa-earth



2\. Backend



cd backend

python -m venv venv



Windows:



venv\\Scripts\\activate



Install dependencies:



pip install -r requirements.txt



Create backend/.env with the local PostgreSQL/PostGIS connection values and JWT secret.



Start FastAPI:



uvicorn app.main:app --reload



Backend documentation:



http://127.0.0.1:8000/docs



3\. Frontend



Open another terminal:



cd frontend

npm install

npm run dev



Frontend:



http://localhost:5173



The frontend uses an environment variable for the Google Maps API key.



Deployment / CI-CD



The application is deployed using Render:



React frontend is deployed as a public web service.



FastAPI backend is deployed as a public web service.



PostgreSQL is used for the deployed database.



Code changes pushed to the GitHub main branch are used for deployment updates.



The challenge specification also requests GitHub Actions and pre-commit quality checks. The current implementation should be reviewed against the repository's existing workflow/configuration before claiming those requirements as fully satisfied.



Technology Trade-offs



The challenge listed Mapbox GL JS for mapping and Highcharts or Chart.js for charting. The current implementation uses Google Maps JavaScript API for mapping and Recharts for charts. These choices provide the required interactive map and charting functionality while keeping the current implementation stable.



Security and Configuration Notes



Do not commit:



.env



database passwords



JWT secrets



API keys



Use environment variables for local and deployed configuration.



Demo Flow



Register a user or log in.



Create an environmental project.



Open Monitoring Sites and add a site.



View the site on the interactive map.



Open analytics for environmental readings.



Fetch weather data for a monitoring site.



Review biodiversity information for the site.

