import 'dotenv/config';
import App from './app';
import EmployeeRoute from './routes/employee.route';
import EventRoute from './routes/event.route';
import TagsRoute from './routes/tags.route';
import BookingRoute from './routes/booking.route';
import uploadtoaws from './routes/uploadtoaws.route';
import DynamicFormRoute from './routes/dynamicform.route';
import validateEnv from './utils/validateEnv';

validateEnv();

const app = new App([new EmployeeRoute(), new EventRoute, new TagsRoute(), new BookingRoute(), new uploadtoaws(), new DynamicFormRoute()]);

app.listen();
