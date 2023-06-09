declare namespace Express {
  interface Request {
    user: any;
    userId?: any;
    userRole?: any;
    session?: any;
  }
  interface Response {
    user: any;
    userId: any;
    userRole: any;
    session: any;
  }
}
