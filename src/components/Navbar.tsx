import { signOutAction, validateRequest } from "@/actions";
import Image from "next/image";
import { FormComponent } from "./FormComponent";
import { Button } from "./ui/button";

export const Navbar = async (): Promise<JSX.Element> => {
  const { user } = await validateRequest();

  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white">
      <Image src="/assets/logo.svg" alt="FigPro Logo" width={58} height={20} />
      {user && (
        <div className="flex flex-col justify-center pt-2">
          <FormComponent action={signOutAction}>
            <Button>Logout</Button>
          </FormComponent>
        </div>
      )}
    </nav>
  );
};
