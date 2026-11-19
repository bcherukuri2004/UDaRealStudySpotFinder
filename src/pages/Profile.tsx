import { User as Icon } from "lucide-react";

const Profile = () => (
  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
      <Icon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
    </div>
    <h1 className="font-marker text-4xl">Profile</h1>
    <p className="mt-2 max-w-sm text-base text-muted-foreground">
      Coming soon.
    </p>
  </div>
);

export default Profile;
