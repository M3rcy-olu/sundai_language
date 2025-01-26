import { redirect } from "next/navigation";
import ChatBot from "./ai/chatbot";
import { Chat } from "openai/resources/index.mjs";
import Link from "next/link";

export default function Home() {
  // const router = useRouter();

  return (
    <main className="home-screen">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">Tongue</h1>
      </nav>

      {/* Main Content */}
      <div className="frame-2">
        <div className="frame-1">
          <div className="headers">
            <h2 className="title">
              <span className="gradient">Speak </span>
              Language. Don't just "Learn".
            </h2>

            <div className="subtext">
              <p>
                With <span className="gradient">Tongue</span>
                <span>, learning a new "tongue" has never been easier.</span>
              </p>
              <br />
              <p>
                Learn your new <span className="gradient">Tongue </span>
                <span>(Spanish) now.</span>
              </p>
            </div>
          </div>
        </div>
        <ChatBot />
      </div>
      <Link className="speak-button" href="/chat">
        <span className="scenario">Speak Now</span>
      </Link>
    </main>
  );
}
