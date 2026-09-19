# -*- coding: utf-8 -*-
"""Build config/settings.production.json from the local settings file.

Railway serves Meteor.settings from the METEOR_SETTINGS environment variable,
which is maintained separately from the files in config/ and drifts from them
silently. This writes the value that variable should hold, so the two can be
compared rather than guessed at.

Seed data (defaultAccounts, defaultRides and friends) is deliberately left out:
it exists to populate a development database and has no place in production.

Nothing is printed except key names -- the file itself carries the secrets.
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "config", "settings.json")
TARGET = os.path.join(ROOT, "config", "settings.production.json")

# Only these survive into production. Everything else in the file is seed data.
KEEP = ("public", "private")

with io.open(SOURCE, encoding="utf-8") as handle:
    settings = json.load(handle)

out = {key: settings[key] for key in KEEP if key in settings}

dropped = sorted(set(settings) - set(out))

with io.open(TARGET, "w", encoding="utf-8", newline="\n") as handle:
    json.dump(out, handle, indent=2, ensure_ascii=False)
    handle.write("\n")


def leaves(node, prefix=""):
    for key, value in node.items():
        if isinstance(value, dict):
            for item in leaves(value, prefix + key + "."):
                yield item
        else:
            yield prefix + key


print("wrote %s (%d bytes)" % (TARGET, os.path.getsize(TARGET)))
print("")
print("kept sections : %s" % ", ".join(sorted(out)))
print("dropped seed  : %s" % (", ".join(dropped) or "none"))
print("")
for section in sorted(out):
    names = sorted(leaves(out[section]))
    print("%s (%d):" % (section, len(names)))
    for name in names:
        print("   " + name)
