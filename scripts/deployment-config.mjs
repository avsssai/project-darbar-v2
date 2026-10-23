/** Keep local root hosting and GitHub project/user Pages URLs in sync. */
export function deploymentConfig(env = process.env) {
  const [owner, repository] = (env.GITHUB_REPOSITORY ?? '').split('/');
  const onGitHub = env.GITHUB_ACTIONS === 'true';
  const project = onGitHub && repository && repository.toLowerCase() !== `${owner}.github.io`.toLowerCase();
  const rawBase = env.ASTRO_BASE ?? (project ? repository : '');
  const segment = rawBase.replace(/^\/+|\/+$/g, '');
  return {
    site: env.ASTRO_SITE || (onGitHub && owner ? `https://${owner}.github.io` : undefined),
    base: segment ? `/${segment}/` : '/',
  };
}
