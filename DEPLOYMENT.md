# Aylwin Wan Public Site Deployment

This folder is the public website. Deploy only this `public` folder.

Do not deploy the repository root while the private life dashboard lives in
`index.html`.

## Launch Checklist

1. Buy `aylwinwan.com`. If available, also buy `aylwinwan.co` and redirect it to
   `aylwinwan.com`.
2. Replace the contact placeholders in `public/index.html` with a real public
   email and LinkedIn URL.
3. Add real links to selected public writing.
4. Deploy the `public` folder through a static host such as Netlify, Cloudflare
   Pages, Vercel, or GitHub Pages.
5. Point the domain DNS to the chosen host.
6. Confirm HTTPS is active.
7. Check that the host applies the headers in `public/_headers`. Netlify and
   Cloudflare Pages support this style directly. Other hosts may need these
   headers configured in their dashboard.

## Security And Maintenance

- Keep this site static until there is a strong reason to add forms, analytics,
  cookies, or server-side code.
- Avoid publishing employer-confidential work, private family details, financial
  information, or unvalidated future claims.
- Use a domain email alias rather than a personal private email address.
- Review public writing links quarterly.
- Review the whole homepage every six months so it remains true.
