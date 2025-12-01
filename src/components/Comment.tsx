import React, { useEffect } from 'react';
import { TWIKOO } from '../config';
import { MessageSquare } from 'lucide-react';

const Comment = () => {
    useEffect(() => {
        const initTwikoo = async () => {
            if (TWIKOO.envId) {
                try {
                    // @ts-ignore
                    const twikoo = await import('twikoo');
                    twikoo.init({
                        envId: TWIKOO.envId,
                        el: '#tcomment',
                    });
                } catch (e) {
                    console.error('Failed to load Twikoo:', e);
                }
            }
        };

        initTwikoo();
    }, []);

    return (
        <div className="w-full mt-12 pt-8 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-8">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                    评论
                </h2>
            </div>
            <div id="tcomment"></div>
        </div>
    );
};

export default Comment;
