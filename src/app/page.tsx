import { redirect } from "next/navigation";
import ChatBot from "./components/chatbot";
import { Chat } from "openai/resources/index.mjs";
import Link from "next/link";
import Button from "./components/button";
import Navbar from "./components/navbar";
import Subtext from "./components/subtext";
import Header from "./components/header";
import PageTransition from "./components/PageTransition";

export default function Home() {
  // const router = useRouter();

  return (
    <PageTransition>
      <main className="page-alignment gap-[14vh]">
        {/* Navbar */}
        <Navbar />
        {/* Main Content */}
        <div className="frame-2">
          <div className="frame-1">
            <h1 className="title">
              <Header text="Speak " gradient={true} />
              <Header text="Language. Don't just 'Learn'." />
            </h1>

            <div className="subtext">
              <p className="w-[25vw]">
                <Subtext text="With " />{" "}
                <Subtext text="Tongue" className="gradient" />
                <Subtext text=", learning a new 'tongue' has never been easier." />
              </p>
              <br />
              <p className="w-[25vw]">
                <Subtext text="Learn your new " />
                <Subtext text="Tongue " className="gradient" />
                <Subtext text="(french) now." />
              </p>
            </div>
          </div>
          <ChatBot showText={true} />
        </div>
        <Link href="/chat" className="order-[3]">
          <Button text="Speak Now" />
        </Link>
      </main>
    </PageTransition>
  );
}
