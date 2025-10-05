"use client";
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import Image from "next/image";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Loading from "./Loading";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const Navbar = () => {
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  const [show, setShow] = useState();
  const [animationParent] = useAutoAnimate();

  return (
    <div className="relative bg-gray-50 h-20" ref={animationParent}>
      <div className="p-4 flex justify-between items-center">
        <div>
          <p className="text-xl">Ganatecnica</p>
        </div>
        <div className="hidden md:flex flex-row items-center">
          {isLoading ? (
            <div className="mr-4">
              <Loading />
            </div>
          ) : user && isAuthenticated ? (
            <ul className="flex flex-row justify-end items-center">
              <li className="p-4">
                <p>{`${user.given_name} ${user.family_name}`}</p>
              </li>
              <li
                className="p-4 relative hover:cursor-pointer"
                // onClick={() => getUserData(user.id)}
              >
                <Link href="/personal">
                  <p>Personal</p>
                </Link>
              </li>
              <li
                className="p-4 relative hover:cursor-pointer"
                // onClick={() => getUserData(user.id)}
              >
                <Link href="/roles">
                  <p>Roles</p>
                </Link>
              </li>
              <li
                className="p-4 relative hover:cursor-pointer"
                // onClick={() => getUserData(user.id)}
              >
                <Link href="/proyectos">
                  <p>Proyectos</p>
                </Link>
              </li>
              <li onClick={() => setShow(false)} className="p-4">
                <LogoutLink>Logout</LogoutLink>
              </li>
            </ul>
          ) : (
            <ul className="flex flex-row justify-end items-center">
              <li onClick={() => setShow(false)} className="p-4">
                <LoginLink>Login</LoginLink>
              </li>
              <li onClick={() => setShow(false)} className="p-4">
                <RegisterLink>Registrarse</RegisterLink>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
