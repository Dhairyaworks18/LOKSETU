import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, doc, increment, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function fetchReports() {
    try {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(docSnap => {
            const data = docSnap.data();

            let progressStep = 1;
            const status = data.status || "submitted";
            if (status === "progress") progressStep = 3;
            else if (status === "resolved") progressStep = 4;

            let timeAgo = data.time || "Just now";
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                const diffMs = new Date() - data.createdAt.toDate();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays > 0) {
                    timeAgo = `${diffDays} days ago`;
                }
            }

            return {
                id: docSnap.id,
                ...data,
                status: status === "progress" ? "IN PROGRESS" : status === "resolved" ? "RESOLVED" : "SUBMITTED",
                progressStep,
                icon: data.emoji || "📝",
                type: data.issue_type || "Other",
                upvotes: data.votes || 0,
                timeAgo,
                photo: data.photo || "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&q=80",
                city: data.location?.split(',')[0] || "Unknown",
                state: data.state || ""
            };
        });
    } catch (err) {
        console.error("fetchReports error:", err);
        return [];
    }
}

export async function submitReport({ title, description, issue_type, location, state, reporter, userId, is_anonymous, emoji, photoFile }) {
    try {
        let photoURL = "";
        if (photoFile) {
            const filename = `reports/${Date.now()}_${photoFile.name || "photo.jpg"}`;
            const fileRef = ref(storage, filename);
            await uploadBytes(fileRef, photoFile);
            photoURL = await getDownloadURL(fileRef);
        }

        await addDoc(collection(db, "reports"), {
            title,
            description,
            issue_type,
            location,
            state: state || "",
            reporter,
            userId: userId || null,
            is_anonymous: !!is_anonymous,
            emoji: emoji || "📝",
            photo: photoURL,
            status: "submitted",
            badgeText: "SUBMITTED",
            votes: 0,
            createdAt: new Date(),
            time: "Just now"
        });
    } catch (err) {
        console.error("submitReport error:", err);
        throw err;
    }
}

export async function upvoteReport(reportId, currentlyUpvoted) {
    try {
        const reportRef = doc(db, "reports", reportId);
        await updateDoc(reportRef, {
            votes: increment(currentlyUpvoted ? -1 : 1)
        });
    } catch (err) {
        console.error("upvoteReport error:", err);
        throw err;
    }
}
