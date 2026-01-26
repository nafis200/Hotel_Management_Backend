
<!-- passport.js --> easy life

<!-- pasport oAuth20 --> 
and 

<!-- pasport local -->



oAuth

npm install passport-google-oauth20

<!-- google client id set at env -->

<!-- go to google cloud console -->

google cloud computing services

click console at navbar

open sidebar and route hit api and services

oAuth consent screen

Get started

App information setup

App name: batch-5-google-oauth

user support email = my email

Audience---> external

Now achieve create oAuth client

oAuth clientId

Name = batch-5-google

Authorized JavaScript origins
backend url  localhost:5000


Authorized redirect URIs

After login SuccessFully 

we give backend url

http://localhost:5000/api/auth/google/callback

Create this then we get client id and secret

<!--  -->
npm install passport-google-oauth20

type lagbe -d

config e passport.ts import

app.ts er ekdom upore

app.use(passport.initialize())

<!-- passport initailize -->

app.use(passport.session())

<!-- passport season create -->

npm i express-session

npm i @types/express-session

import it at app.ts

app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

config passport.ts

<!-- google api -->

auth route.ts

router.get("/google", async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/"
    passport.authenticate("google", { scope: ["profile", "email"], state: redirect as string })(req, res, next)
})

<!-- then go to controller -->

Now passport.ts serialize korbo

passport file ta app.ts e run korte hobe

app.ts e import "./app/config/passport" import this